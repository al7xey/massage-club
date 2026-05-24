import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { SubscriptionPlansService } from './subscription-plans.service';

@ApiTags('Subscription plans')
@Controller('subscription-plans')
@UseGuards(OptionalJwtAuthGuard)
export class SubscriptionPlansController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Get()
  findAll() {
    return this.subscriptionPlansService.findAll();
  }
}

@ApiTags('Tariffs')
@Controller('tariffs')
@UseGuards(OptionalJwtAuthGuard)
export class TariffsController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Get()
  findAll() {
    return this.subscriptionPlansService.findAll();
  }
}
