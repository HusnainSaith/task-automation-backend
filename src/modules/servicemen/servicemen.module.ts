import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicemenService } from './servicemen.service';
import { ServicemenController } from './servicemen.controller';
import { MapsModule } from '../maps/maps.module';
import { Serviceman, Location } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Serviceman, Location]),
    MapsModule,
  ],
  controllers: [ServicemenController],
  providers: [ServicemenService],
  exports: [ServicemenService],
})
export class ServicemenModule {}