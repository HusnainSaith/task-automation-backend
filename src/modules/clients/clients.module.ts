import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { MapsModule } from '../maps/maps.module';
import { User, Client, UserProfile, Location } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, UserProfile, Location]),
    MapsModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}