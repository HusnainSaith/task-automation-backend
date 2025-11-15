import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { MapsModule } from '../maps/maps.module';
import { Task, Serviceman, TaskAssignment, Location, Client } from '../../entities';
import { OpenAIService } from '../../services/openai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Serviceman, TaskAssignment, Location, Client]),
    MapsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, OpenAIService],
  exports: [TasksService],
})
export class TasksModule {}