import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company, Task, TaskStatus, User, Client, Serviceman } from '../../entities';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Serviceman) private servicemanRepo: Repository<Serviceman>,
  ) {}

  async getDashboard(companyId: string) {
    const [
      totalTasks,
      pendingTasks,
      completedTasks,
      totalClients,
      totalServicemen,
      activeServicemen
    ] = await Promise.all([
      this.taskRepo.count({ where: { companyId } }),
      this.taskRepo.count({ where: { companyId, status: TaskStatus.PENDING } }),
      this.taskRepo.count({ where: { companyId, status: TaskStatus.COMPLETED } }),
      this.clientRepo.count({ where: { user: { companyId } } }),
      this.servicemanRepo.count({ where: { user: { companyId } } }),
      this.servicemanRepo.count({ where: { user: { companyId }, isOnline: true } })
    ]);

    return {
      totalTasks,
      pendingTasks,
      completedTasks,
      totalClients,
      totalServicemen,
      activeServicemen
    };
  }
}