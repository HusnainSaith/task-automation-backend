import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Client } from './client.entity';
import { Location } from './location.entity';
import { TaskAssignment } from './task-assignment.entity';

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'client_id' })
  clientId: string;

  @Column('text')
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column('uuid', { name: 'location_id' })
  locationId: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.PENDING })
  status: TaskStatus;

  @Column('integer', { default: 0 })
  priority: number;

  @Column('timestamptz', { name: 'scheduled_at', nullable: true })
  scheduledAt: Date;

  @Column('timestamptz', { name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @OneToMany(() => TaskAssignment, assignment => assignment.task)
  assignments: TaskAssignment[];
}