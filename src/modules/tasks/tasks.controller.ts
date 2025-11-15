import { Controller, Post, Patch, Get, Param, UseGuards, Request, Query, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-tasks.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {
    console.log('TasksController initialized');
  }

  @Get()
  async getTasks(@Request() req, @Query('status') status?: string) {
    return this.tasksService.getTasksByCompany(req.user.companyId, status);
  }

  @Get(':taskId')
  async getTask(@Param('taskId') taskId: string) {
    return this.tasksService.getTaskById(taskId);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    console.log('=== TASK CREATION REQUEST RECEIVED ===');
    console.log('Request body:', createTaskDto);
    console.log('User from JWT:', req.user);
    console.log('=====================================');
    
    try {
      const result = await this.tasksService.createTask(createTaskDto, req.user.companyId);
      console.log('Task creation successful:', result);
      return result;
    } catch (error) {
      console.error('Task creation failed with error:', error);
      throw error;
    }
  }

  @Post(':taskId/assign')
  async assignTask(@Param('taskId') taskId: string) {
    return this.tasksService.tryAssignTask(taskId);
  }

  @Patch(':taskId/complete')
  async completeTask(@Param('taskId') taskId: string, @Request() req) {
    return this.tasksService.completeTask(taskId, req.user.userId);
  }
}