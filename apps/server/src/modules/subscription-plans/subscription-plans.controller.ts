import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionPlansService } from './subscription-plans.service';

@ApiTags('Subscription plans')
@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Get()
  findAll() {
    return this.subscriptionPlansService.findAll();
  }
}
