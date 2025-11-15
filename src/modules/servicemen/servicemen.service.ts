import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Serviceman, Location } from '../../entities';
import { MapsService } from '../maps/maps.service';
import { CreateServicemanDto } from './dto/create-servicemen.dto';

@Injectable()
export class ServicemenService {
  constructor(
    @InjectRepository(Serviceman) private servicemanRepo: Repository<Serviceman>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
    private mapsService: MapsService,
  ) {}

  async createServiceman(createServicemanDto: CreateServicemanDto, companyId: string) {
    // Geocode the home base address
    const geocoded = await this.mapsService.geocodeAddress(createServicemanDto.homeBaseAddress);
    
    // Create or find location
    let location = await this.locationRepo.findOne({ 
      where: { placeId: geocoded.placeId } 
    });

    if (!location) {
      location = this.locationRepo.create({
        companyId,
        addressLine: geocoded.formattedAddress,
        lat: Number(geocoded.lat),
        lng: Number(geocoded.lng),
        placeId: geocoded.placeId,
      });
      await this.locationRepo.save(location);
    }

    // Create serviceman
    const serviceman = this.servicemanRepo.create({
      userId: createServicemanDto.userId,
      homeBaseLocationId: location.id,
      skills: createServicemanDto.skills || [],
      isOnline: true,
      currentActiveTasks: 0,
      maxConcurrentTasks: 2,
    });

    return this.servicemanRepo.save(serviceman);
  }
}