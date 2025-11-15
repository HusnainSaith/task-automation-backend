import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, Client, Serviceman, UserProfile, Location } from '../../entities';
import { MapsService } from '../maps/maps.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Serviceman) private servicemanRepo: Repository<Serviceman>,
    @InjectRepository(UserProfile) private profileRepo: Repository<UserProfile>,
    @InjectRepository(Location) private locationRepo: Repository<Location>,
    private mapsService: MapsService,
  ) {}

  async createClient(companyId: string, email: string, password: string, name?: string, phone?: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: UserRole.CLIENT,
      companyId,
    });

    try {
      await this.userRepo.save(user);
      
      const profile = this.profileRepo.create({
        userId: user.id,
        name,
        phone,
      });
      await this.profileRepo.save(profile);

      const client = this.clientRepo.create({
        userId: user.id,
      });
      await this.clientRepo.save(client);

      return { user, client };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async createServiceman(companyId: string, email: string, password: string, name?: string, phone?: string, skills?: string[]) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepo.create({
      email,
      passwordHash: hashedPassword,
      role: UserRole.SERVICEMAN,
      companyId,
    });

    try {
      await this.userRepo.save(user);
      
      const profile = this.profileRepo.create({
        userId: user.id,
        name,
        phone,
      });
      await this.profileRepo.save(profile);

      const serviceman = this.servicemanRepo.create({
        userId: user.id,
        skills: skills || [],
      });
      await this.servicemanRepo.save(serviceman);

      return { user, serviceman };
    } catch (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Email already exists');
      }
      throw error;
    }
  }

  async getClientsByCompany(companyId: string) {
    return this.clientRepo.find({
      where: { user: { companyId } },
      relations: ['user', 'user.profile', 'defaultLocation'],
    });
  }

  async getServicemenByCompany(companyId: string) {
    const servicemen = await this.servicemanRepo.find({
      where: { user: { companyId } },
      relations: ['user', 'user.profile', 'homeBaseLocation'],
    });
    console.log('Loaded servicemen with locations:', servicemen.map(s => ({ id: s.id, homeBaseLocationId: s.homeBaseLocationId, homeBaseLocation: s.homeBaseLocation })));
    return servicemen;
  }

  async setServicemanLocation(userId: string, address: string, companyId: string) {
    console.log('Setting location for user ID:', userId);
    console.log('Company ID:', companyId);
    
    const serviceman = await this.servicemanRepo.findOne({
      where: { userId: userId, user: { companyId } },
      relations: ['user'],
    });

    if (!serviceman) {
      console.log('Serviceman not found with user ID:', userId, 'and companyId:', companyId);
      throw new BadRequestException('Serviceman not found for this user');
    }

    console.log('Found serviceman for logged-in user:', {
      servicemanId: serviceman.id,
      userId: serviceman.userId,
      userEmail: serviceman.user?.email
    });

    const geocoded = await this.mapsService.geocodeAddress(address);
    console.log('Geocoded address:', geocoded);
    
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
      console.log('Created new location:', location.id);
    } else {
      // Update existing location to ensure coordinates are numbers
      location.lat = Number(geocoded.lat);
      location.lng = Number(geocoded.lng);
      location.addressLine = geocoded.formattedAddress;
      await this.locationRepo.save(location);
      console.log('Updated existing location:', location.id);
    }

    console.log('Before update - serviceman homeBaseLocationId:', serviceman.homeBaseLocationId);
    console.log('Setting new location ID:', location.id);
    
    serviceman.homeBaseLocationId = location.id;
    
    console.log('After setting - serviceman homeBaseLocationId:', serviceman.homeBaseLocationId);
    
    const savedServiceman = await this.servicemanRepo.save(serviceman);
    console.log('Saved serviceman result:', {
      id: savedServiceman.id,
      homeBaseLocationId: savedServiceman.homeBaseLocationId,
      userId: savedServiceman.userId
    });

    // Verify the save by querying again
    const verifyServiceman = await this.servicemanRepo.findOne({
      where: { id: serviceman.id },
      relations: ['homeBaseLocation'],
    });
    console.log('Database verification - serviceman after save:', {
      id: verifyServiceman?.id,
      homeBaseLocationId: verifyServiceman?.homeBaseLocationId,
      hasLocation: !!verifyServiceman?.homeBaseLocation,
      locationDetails: verifyServiceman?.homeBaseLocation ? {
        id: verifyServiceman.homeBaseLocation.id,
        lat: verifyServiceman.homeBaseLocation.lat,
        lng: verifyServiceman.homeBaseLocation.lng
      } : null
    });

    return { message: 'Serviceman location updated successfully', location, serviceman: verifyServiceman };
  }

  async toggleServicemanStatus(servicemanId: string, isOnline: boolean, companyId: string) {
    const serviceman = await this.servicemanRepo.findOne({
      where: { id: servicemanId, user: { companyId } },
    });

    if (!serviceman) {
      throw new BadRequestException('Serviceman not found');
    }

    serviceman.isOnline = isOnline;
    await this.servicemanRepo.save(serviceman);

    return { message: `Serviceman is now ${isOnline ? 'online' : 'offline'}` };
  }

  async getServicemanByUserId(userId: string) {
    const serviceman = await this.servicemanRepo.findOne({
      where: { userId },
      relations: ['user', 'user.profile', 'homeBaseLocation'],
    });

    if (!serviceman) {
      throw new BadRequestException('Serviceman not found');
    }

    console.log('Serviceman with location:', {
      id: serviceman.id,
      homeBaseLocationId: serviceman.homeBaseLocationId,
      homeBaseLocation: serviceman.homeBaseLocation
    });

    return serviceman;
  }

  async setClientLocation(clientId: string, address: string, companyId: string) {
    const client = await this.clientRepo.findOne({
      where: { id: clientId, user: { companyId } },
      relations: ['user'],
    });

    if (!client) {
      throw new BadRequestException('Client not found');
    }

    const geocoded = await this.mapsService.geocodeAddress(address);
    
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

    client.defaultLocationId = location.id;
    await this.clientRepo.save(client);

    return { message: 'Client location updated successfully', location };
  }
}