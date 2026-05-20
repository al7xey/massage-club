import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { GiftCertificatesModule } from '../gift-certificates/gift-certificates.module';
import { MastersModule } from '../masters/masters.module';
import { PaymentsModule } from '../payments/payments.module';
import { ServicesModule } from '../services/services.module';
import { StudiosModule } from '../studios/studios.module';
import { SubscriptionPlansModule } from '../subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UsersModule } from '../users/users.module';
import { SystemSetting } from './entities/system-setting.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting]),
    AppointmentsModule,
    UsersModule,
    AnalyticsModule,
    ServicesModule,
    StudiosModule,
    MastersModule,
    SubscriptionPlansModule,
    SubscriptionsModule,
    GiftCertificatesModule,
    PaymentsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
