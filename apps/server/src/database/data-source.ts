import 'reflect-metadata';
import { config } from 'dotenv';
import path from 'node:path';
import { DataSource } from 'typeorm';

config({ path: path.resolve(__dirname, '../../../../.env') });
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER ?? 'massage_app',
  password: process.env.POSTGRES_PASSWORD ?? 'massage_password',
  database: process.env.POSTGRES_DB ?? 'massage_subscriptions',
  entities: [path.resolve(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [path.resolve(__dirname, './migrations/*.{ts,js}')],
  synchronize: false,
  logging: process.env.DATABASE_LOGGING === 'true',
});
