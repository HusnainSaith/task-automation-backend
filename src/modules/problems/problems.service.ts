import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, Location, Client } from '../../entities';
import { MapsService } from '../maps/maps.service';
import { TasksService } from '../tasks/tasks.service';
import { ReportProblemDto } from './dto/report-problem.dto';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    private mapsService: MapsService,
    private tasksService: TasksService,
  ) {}

  async reportProblem(
    userId: string,
    reportProblemDto: ReportProblemDto,
    companyId: string
  ) {
    const client = await this.clientRepo.findOne({ where: { userId } });
    if (!client) {
      throw new Error('Client not found');
    }

    const geocoded = await this.mapsService.geocodeAddress(reportProblemDto.address);
    
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
      companyId,
      clientId: client.id,
      locationId: location.id,
      title: reportProblemDto.title,
      description: reportProblemDto.description,
      status: TaskStatus.PENDING,
    });

    const savedTask = await this.taskRepo.save(task);
    
    // Automatically assign task to nearest serviceman
    const assignmentResult = await this.tasksService.tryAssignTask(savedTask.id);
    
    return { 
      task: savedTask, 
      assignmentResult, 
      message: assignmentResult.success 
        ? 'Problem reported and task assigned successfully' 
        : `Problem reported but assignment failed: ${assignmentResult.message}`
    };
  }
}