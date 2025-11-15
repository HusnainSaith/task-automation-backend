import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Location } from './location.entity';

@Entity('servicemen')
export class Serviceman {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @Column('integer', { name: 'current_active_tasks', default: 0 })
  currentActiveTasks: number;

  @Column('integer', { name: 'max_concurrent_tasks', default: 2 })
  maxConcurrentTasks: number;

  @Column('uuid', { name: 'home_base_location_id', nullable: true })
  homeBaseLocationId: string;

  @Column('text', { array: true, nullable: true })
  skills: string[];

  @Column('boolean', { name: 'is_online', default: true })
  isOnline: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'home_base_location_id' })
  homeBaseLocation: Location;
}