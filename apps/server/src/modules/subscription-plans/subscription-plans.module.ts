import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlansController, TariffsController } from './subscription-plans.controller';
import { SubscriptionPlansService } from './subscription-plans.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan])],
  controllers: [SubscriptionPlansController, TariffsController],
  providers: [SubscriptionPlansService],
  exports: [SubscriptionPlansService, TypeOrmModule],
})
export class SubscriptionPlansModule {}
