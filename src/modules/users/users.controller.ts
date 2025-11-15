import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('clients')
  async getClients(@Request() req) {
    return this.usersService.getClientsByCompany(req.user.companyId);
  }

  @Get('servicemen')
  async getServicemen(@Request() req) {
    return this.usersService.getServicemenByCompany(req.user.companyId);
  }

  @Get('servicemen/profile')
  async getServicemanProfile(@Request() req) {
    return this.usersService.getServicemanByUserId(req.user.userId);
  }

  @Post('clients')
  async createClient(
    @Body() body: { email: string; password: string; name?: string; phone?: string },
    @Request() req
  ) {
    return this.usersService.createClient(
      req.user.companyId,
      body.email,
      body.password,
      body.name,
      body.phone
    );
  }

  @Post('servicemen')
  async createServiceman(
    @Body() body: { email: string; password: string; name?: string; phone?: string; skills?: string[] },
    @Request() req
  ) {
    return this.usersService.createServiceman(
      req.user.companyId,
      body.email,
      body.password,
      body.name,
      body.phone,
      body.skills
    );
  }

  @Patch('servicemen/my-location')
  async setServicemanLocation(
    @Body() body: { address: string },
    @Request() req
  ) {
    return this.usersService.setServicemanLocation(req.user.userId, body.address, req.user.companyId);
  }

  @Patch('servicemen/:servicemanId/status')
  async toggleServicemanStatus(
    @Param('servicemanId') servicemanId: string,
    @Body() body: { isOnline: boolean },
    @Request() req
  ) {
    return this.usersService.toggleServicemanStatus(servicemanId, body.isOnline, req.user.companyId);
  }

  @Patch('clients/:clientId/location')
  async setClientLocation(
    @Param('clientId') clientId: string,
    @Body() body: { address: string },
    @Request() req
  ) {
    return this.usersService.setClientLocation(clientId, body.address, req.user.companyId);
  }
}