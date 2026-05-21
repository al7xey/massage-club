import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlansService } from './subscription-plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, User])],
  controllers: [SubscriptionPlansController],
  providers: [SubscriptionPlansService],
  exports: [SubscriptionPlansService, TypeOrmModule],
})
export class SubscriptionPlansModule {}
