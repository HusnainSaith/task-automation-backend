import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'company_id', nullable: true })
  companyId: string;

  @Column('text', { name: 'address_line', nullable: true })
  addressLine: string;

  @Column('text', { nullable: true })
  city: string;

  @Column('text', { nullable: true })
  country: string;

  @Column('decimal', { 
    precision: 9, 
    scale: 6, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  lat: number;

  @Column('decimal', { 
    precision: 9, 
    scale: 6, 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => value ? parseFloat(value) : null
    }
  })
  lng: number;

  @Column('text', { name: 'place_id', nullable: true })
  placeId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;
}