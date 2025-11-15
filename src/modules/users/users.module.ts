import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MapsModule } from '../maps/maps.module';
import { User, Client, Serviceman, UserProfile, Location } from '../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, Serviceman, UserProfile, Location]),
    MapsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}