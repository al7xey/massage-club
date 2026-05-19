import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findMine(@CurrentUser() user: JwtUserPayload) {
    return this.cartService.findMine(user.sub);
  }

  @Post('items')
  addItem(@CurrentUser() user: JwtUserPayload, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.cartService.removeItem(user.sub, id);
  }

  @Delete()
  clear(@CurrentUser() user: JwtUserPayload) {
    return this.cartService.clear(user.sub);
  }

  @Post('checkout')
  checkout(@CurrentUser() user: JwtUserPayload, @Body() dto: CheckoutCartDto) {
    return this.cartService.checkout(user.sub, dto);
  }
}
