import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { SubscriptionPlansService } from './subscription-plans.service';

@ApiTags('Subscription plans')
@Controller('subscription-plans')
@UseGuards(OptionalJwtAuthGuard)
export class SubscriptionPlansController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Get()
  findAll(@CurrentUser() user?: JwtUserPayload) {
    return this.subscriptionPlansService.findAll(user?.sub);
  }
}
