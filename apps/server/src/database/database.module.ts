import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>('POSTGRES_USER', 'massage_app'),
        password: configService.get<string>('POSTGRES_PASSWORD', 'massage_password'),
        database: configService.get<string>('POSTGRES_DB', 'massage_subscriptions'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DATABASE_SYNCHRONIZE', 'true') === 'true',
        logging: configService.get<string>('DATABASE_LOGGING', 'false') === 'true',
      }),
    }),
  ],
})
export class DatabaseModule {}
