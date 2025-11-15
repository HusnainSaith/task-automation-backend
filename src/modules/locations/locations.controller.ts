import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  async getLocations(@Request() req) {
    return this.locationsService.getLocationsByCompany(req.user.companyId);
  }
}