import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as entities from '../entities';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'field_service_db',
  entities: Object.values(entities).filter(entity => typeof entity === 'function'),
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});