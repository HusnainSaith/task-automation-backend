import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, Client, UserProfile, Location } from '../../entities';
import { MapsService } from '../maps/maps.service';
import { CreateClientDto } from './dto/create-clients.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
    private mapsService: MapsService,
  ) {}

  async createClient(createClientDto: CreateClientDto, companyId: string) {
    const hashedPassword = await bcrypt.hash(createClientDto.password, 10);
    
    // Geocode the client's address
    const geocoded = await this.mapsService.geocodeAddress(createClientDto.address);
    
    // Create or find location
    let location = await this.locationRepo.findOne({ 
      where: { placeId: geocoded.placeId } 
    });

    if (!location) {
      location = this.locationRepo.create({
        companyId,
        addressLine: geocoded.formattedAddress,
        lat: geocoded.lat,
        lng: geocoded.lng,
        placeId: geocoded.placeId,
      });
      await this.locationRepo.save(location);
    }

    // Create user
    const user = this.userRepo.create({
      email: createClientDto.email,
      passwordHash: hashedPassword,
      role: UserRole.CLIENT,
      companyId,
    });

    try {
      await this.userRepo.save(user);
      
      // Create user profile
      const profile = this.profileRepo.create({
        userId: user.id,
        name: createClientDto.name,
        phone: createClientDto.phone,
      });
      await this.profileRepo.save(profile);

      // Create client with default location
      const client = this.clientRepo.create({
        userId: user.id,
        defaultLocationId: location.id,
      });
      await this.clientRepo.save(client);

      return { user, client, location };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }
}