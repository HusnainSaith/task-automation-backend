import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, UnitSystem } from '@googlemaps/google-maps-services-js';

@Injectable()
export class MapsService {
  private client: Client;

  constructor(private config: ConfigService) {
    this.client = new Client({});
  }

  async geocodeAddress(address: string) {
    const response = await this.client.geocode({
      params: {
        address,
        key: this.config.get<string>('GOOGLE_MAPS_API_KEY') || '',
      },
    });

    if (response.data.results.length === 0) {
      throw new Error('Address not found');
    }

    const result = response.data.results[0];
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
    };
  }

  async getDistanceMatrix(origins: string[], destinations: string[]) {
    const response = await this.client.distancematrix({
      params: {
        origins,
        destinations,
        key: this.config.get<string>('GOOGLE_MAPS_API_KEY') || '',
        units: UnitSystem.metric,
      },
    });

    return response.data;
  }

  async findNearestServiceman(
    taskLocation: { lat: number; lng: number }, 
    servicemanLocations: Array<{ id: string; lat: number; lng: number }>
  ): Promise<{ servicemanId: string; distance: number; duration: number } | null> {
    const origins = [`${taskLocation.lat},${taskLocation.lng}`];
    const destinations = servicemanLocations.map(loc => `${loc.lat},${loc.lng}`);

    const matrix = await this.getDistanceMatrix(origins, destinations);
    
    let nearest: { servicemanId: string; distance: number; duration: number } | null = null;
    let shortestDistance = Infinity;

    matrix.rows[0].elements.forEach((element, index) => {
      if (element.status === 'OK' && element.distance.value < shortestDistance) {
        shortestDistance = element.distance.value;
        nearest = {
          servicemanId: servicemanLocations[index].id,
          distance: element.distance.value,
          duration: element.duration.value,
        };
      }
    });

    return nearest;
  }

  async findAllNearbyServicemen(
    taskLocation: { lat: number; lng: number }, 
    servicemanLocations: Array<{ id: string; lat: number; lng: number }>
  ): Promise<Array<{ servicemanId: string; distance: number; duration: number }>> {
    const origins = [`${taskLocation.lat},${taskLocation.lng}`];
    const destinations = servicemanLocations.map(loc => `${loc.lat},${loc.lng}`);

    const matrix = await this.getDistanceMatrix(origins, destinations);
    
    const allServicemen: Array<{ servicemanId: string; distance: number; duration: number }> = [];

    matrix.rows[0].elements.forEach((element, index) => {
      if (element.status === 'OK') {
        allServicemen.push({
          servicemanId: servicemanLocations[index].id,
          distance: element.distance.value,
          duration: element.duration.value,
        });
      }
    });

    // Sort by distance (nearest first)
    return allServicemen.sort((a, b) => a.distance - b.distance);
  }
}