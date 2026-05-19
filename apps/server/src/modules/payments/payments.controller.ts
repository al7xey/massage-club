import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { MockCheckoutDto } from './dto/mock-checkout.dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mock-checkout')
  mockCheckout(@CurrentUser() user: JwtUserPayload, @Body() dto: MockCheckoutDto) {
    return this.paymentsService.mockCheckout(user.sub, dto);
  }

  @Get('my')
  findMine(@CurrentUser() user: JwtUserPayload) {
    return this.paymentsService.findMine(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
