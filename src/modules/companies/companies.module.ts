import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company, Task, User, Client, Serviceman } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Task, User, Client, Serviceman])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}