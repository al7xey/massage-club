import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { Service } from './entities/service.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceCategory, User, Subscription])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService, TypeOrmModule],
})
export class ServicesModule {}
