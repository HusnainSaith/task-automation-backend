import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { Client } from './client.entity';
import { Location } from './location.entity';

export enum ProblemStatus {
  RECEIVED = 'received',
  CONVERTED_TO_TASK = 'converted_to_task',
  CLOSED = 'closed'
}

@Entity('problems')
export class Problem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('uuid', { name: 'client_id' })
  clientId: string;

  @Column('uuid', { name: 'location_id' })
  locationId: string;

  @Column('text')
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ProblemStatus, default: ProblemStatus.RECEIVED })
  status: ProblemStatus;

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
}