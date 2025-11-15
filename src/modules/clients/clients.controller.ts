import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-clients.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Post()
  async createClient(
    @Body() createClientDto: CreateClientDto,
    @Request() req
  ) {
    return this.clientsService.createClient(createClientDto, req.user.companyId);
  }
}