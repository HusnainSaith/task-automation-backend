import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from './task.entity';
import { Serviceman } from './serviceman.entity';

@Entity('task_assignments')
export class TaskAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'task_id' })
  taskId: string;

  @Column('uuid', { name: 'serviceman_id' })
  servicemanId: string;

  @Column('timestamptz', { name: 'assigned_at' })
  assignedAt: Date;

  @Column('timestamptz', { name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column('timestamptz', { name: 'finished_at', nullable: true })
  finishedAt: Date;

  @Column('integer', { name: 'distance_meters', nullable: true })
  distanceMeters: number;

  @Column('integer', { name: 'duration_seconds', nullable: true })
  durationSeconds: number;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => Serviceman)
  @JoinColumn({ name: 'serviceman_id' })
  serviceman: Serviceman;
}