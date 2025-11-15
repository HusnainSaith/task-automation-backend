import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards';
import { ServicemenService } from './servicemen.service';
import { CreateServicemanDto } from './dto/create-servicemen.dto';

@Controller('servicemen')
@UseGuards(JwtAuthGuard)
export class ServicemenController {
  constructor(private servicemenService: ServicemenService) {}

  @Post()
  async createServiceman(
    @Body() createServicemanDto: CreateServicemanDto,
    @Request() req
  ) {
    return this.servicemenService.createServiceman(createServicemanDto, req.user.companyId);
  }
}