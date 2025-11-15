import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from '../../entities';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location) private locationRepo: Repository<Location>,
  ) {}

  async getLocationsByCompany(companyId: string) {
    return this.locationRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }
}