import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { MapsModule } from '../maps/maps.module';
import { TasksModule } from '../tasks/tasks.module';
import { Task, Location, Client } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Location, Client]),
    MapsModule,
    forwardRef(() => TasksModule),
  ],
  controllers: [ProblemsController],
  providers: [ProblemsService],
  exports: [ProblemsService],
})
export class ProblemsModule {}