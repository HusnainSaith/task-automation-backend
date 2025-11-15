import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { UserProfile } from './user-profile.entity';

export enum UserRole {
  OWNER = 'owner',
  SERVICEMAN = 'serviceman',
  CLIENT = 'client'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id' })
  companyId: string;

  @Column('citext')
  email: string;

  @Column('text', { name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column('boolean', { name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company, company => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToOne(() => UserProfile, profile => profile.user)
  profile: UserProfile;
}