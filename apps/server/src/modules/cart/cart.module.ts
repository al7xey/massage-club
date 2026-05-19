import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MasterShift } from '../masters/entities/master-shift.entity';
import { Master } from '../masters/entities/master.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { SubscriptionCredit } from '../subscriptions/entities/subscription-credit.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CartItem,
      User,
      Service,
      Studio,
      Master,
      MasterShift,
      Subscription,
      SubscriptionCredit,
      Appointment,
      Payment,
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService, TypeOrmModule],
})
export class CartModule {}
