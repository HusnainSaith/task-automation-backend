import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Task, TaskStatus, Serviceman, TaskAssignment, Location, Client } from '../../entities';
import { MapsService } from '../maps/maps.service';
import { CreateTaskDto } from './dto/create-tasks.dto';
import { OpenAIService } from '../../services/openai.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Serviceman) private servicemanRepo: Repository<Serviceman>,
    @InjectRepository(TaskAssignment) private assignmentRepo: Repository<TaskAssignment>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    private mapsService: MapsService,
    private openaiService: OpenAIService,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, companyId: string) {
    // Find client by userId (since clientId in DTO is actually userId)
    const client = await this.clientRepo.findOne({
      where: { userId: createTaskDto.clientId, user: { companyId } }
    });
    
    if (!client) {
      throw new BadRequestException(`Client with user ID ${createTaskDto.clientId} not found`);
    }

    // Geocode the address to create/find location
    const geocoded = await this.mapsService.geocodeAddress(createTaskDto.address);
    
    let location = await this.locationRepo.findOne({ 
      where: { placeId: geocoded.placeId } 
    });

    if (!location) {
      location = this.locationRepo.create({
        companyId,
        addressLine: geocoded.formattedAddress,
        lat: geocoded.lat,
        lng: geocoded.lng,
        placeId: geocoded.placeId,
      });
      await this.locationRepo.save(location);
    }

    const task = this.taskRepo.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      clientId: client.id,
      locationId: location.id,
      priority: createTaskDto.priority || 0,
      companyId,
      scheduledAt: createTaskDto.scheduledAt ? new Date(createTaskDto.scheduledAt) : undefined,
    });

    const savedTask = await this.taskRepo.save(task);
    
    // Automatically try to assign the task
    const assignmentResult = await this.tryAssignTask(savedTask.id);
    
    return { task: savedTask, assignmentResult };
  }

  async tryAssignTask(taskId: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['location'],
    });

    if (!task || task.status !== TaskStatus.PENDING) {
      return { success: false, message: 'Task not available for assignment' };
    }

    const availableServicemen = await this.servicemanRepo.find({
      where: { 
        isOnline: true,
        user: { companyId: task.companyId, isActive: true }
      },
      relations: ['user', 'homeBaseLocation'],
    });

    const freeServicemen = availableServicemen.filter(
      s => s.currentActiveTasks < s.maxConcurrentTasks
    );

    if (freeServicemen.length === 0) {
      return { 
        success: false, 
        message: 'Serviceman is not free (serviceman have already assign two task)' 
      };
    }

    const servicemanLocations = freeServicemen
      .filter(s => s.homeBaseLocation)
      .map(s => ({
        id: s.id,
        lat: Number(s.homeBaseLocation.lat),
        lng: Number(s.homeBaseLocation.lng),
      }));

    if (servicemanLocations.length === 0) {
      return { success: false, message: 'No servicemen with valid locations' };
    }

    // Get all servicemen sorted by distance
    const allNearbyServicemen = await this.mapsService.findAllNearbyServicemen(
      { lat: Number(task.location.lat), lng: Number(task.location.lng) },
      servicemanLocations
    );

    if (!allNearbyServicemen || allNearbyServicemen.length === 0) {
      return { success: false, message: 'Could not find any nearby servicemen' };
    }

    // Try to assign to servicemen in order of proximity
    for (const nearbyServiceman of allNearbyServicemen) {
      const serviceman = freeServicemen.find(s => s.id === nearbyServiceman.servicemanId);
      
      if (serviceman && serviceman.currentActiveTasks < serviceman.maxConcurrentTasks) {
        // Use OpenAI to verify this serviceman is suitable
        const aiAnalysis = await this.openaiService.analyzeTaskAssignment(
          { title: task.title, description: task.description },
          [serviceman.skills || []]
        );

        const assignment = this.assignmentRepo.create({
          taskId: task.id,
          servicemanId: serviceman.id,
          assignedAt: new Date(),
          distanceMeters: nearbyServiceman.distance,
          durationSeconds: nearbyServiceman.duration,
        });

        await this.assignmentRepo.save(assignment);

        task.status = TaskStatus.ASSIGNED;
        await this.taskRepo.save(task);

        serviceman.currentActiveTasks += 1;
        await this.servicemanRepo.save(serviceman);

        return { 
          success: true, 
          assignment, 
          aiReasoning: aiAnalysis.reasoning,
          message: `Task assigned to serviceman ${serviceman.id}. ${aiAnalysis.reasoning}`
        };
      }
    }

    return { success: false, message: 'All nearby servicemen are busy (have 2 active tasks)' };


  }

  async completeTask(taskId: string, userId: string) {
    // First find the serviceman by userId
    const serviceman = await this.servicemanRepo.findOne({
      where: { userId }
    });

    if (!serviceman) {
      throw new BadRequestException('Serviceman not found');
    }

    // Then find the assignment using the serviceman ID
    const assignment = await this.assignmentRepo.findOne({
      where: { taskId, servicemanId: serviceman.id },
      relations: ['task', 'serviceman', 'serviceman.user'],
    });

    if (!assignment) {
      throw new BadRequestException('Assignment not found');
    }

    assignment.finishedAt = new Date();
    assignment.task.status = TaskStatus.COMPLETED;
    assignment.task.completedAt = new Date();

    await this.assignmentRepo.save(assignment);
    await this.taskRepo.save(assignment.task);

    assignment.serviceman.currentActiveTasks -= 1;
    await this.servicemanRepo.save(assignment.serviceman);

    await this.processNextPendingTask(assignment.task.companyId);

    return { message: `task is complete by ${taskId}` };
  }

  async getTasksByCompany(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) {
      // Handle multiple statuses separated by comma
      const statuses = status.split(',').map(s => s.trim());
      if (statuses.length > 1) {
        where.status = In(statuses);
      } else {
        where.status = status;
      }
    }
    
    return this.taskRepo.find({
      where,
      relations: ['client', 'client.user', 'client.user.profile', 'location', 'assignments', 'assignments.serviceman', 'assignments.serviceman.user', 'assignments.serviceman.user.profile'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTaskById(taskId: string) {
    return this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['client', 'location', 'client.user'],
    });
  }

  private async processNextPendingTask(companyId: string) {
    const pendingTask = await this.taskRepo.findOne({
      where: { companyId, status: TaskStatus.PENDING },
      order: { createdAt: 'ASC' },
    });

    if (pendingTask) {
      await this.tryAssignTask(pendingTask.id);
    }
  }
}