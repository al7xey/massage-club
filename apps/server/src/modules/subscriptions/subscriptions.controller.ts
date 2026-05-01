import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { FreezeSubscriptionDto } from './dto/freeze-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(user.sub, dto);
  }

  @Get('me')
  findMine(@CurrentUser() user: JwtUserPayload) {
    return this.subscriptionsService.findMine(user.sub);
  }

  @Patch(':id/freeze')
  freeze(@CurrentUser() user: JwtUserPayload, @Param('id') id: string, @Body() dto: FreezeSubscriptionDto) {
    return this.subscriptionsService.freeze(user.sub, id, dto);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.subscriptionsService.cancel(user.sub, id);
  }
}
