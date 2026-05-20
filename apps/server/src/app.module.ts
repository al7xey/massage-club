import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { GiftCertificatesModule } from './modules/gift-certificates/gift-certificates.module';
import { MastersModule } from './modules/masters/masters.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ServicesModule } from './modules/services/services.module';
import { StudiosModule } from './modules/studios/studios.module';
import { SubscriptionPlansModule } from './modules/subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { SupportTicketsModule } from './modules/support-tickets/support-tickets.module';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
      validate: validateEnv,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    StudiosModule,
    ServicesModule,
    MastersModule,
    SubscriptionPlansModule,
    SubscriptionsModule,
    AppointmentsModule,
    CartModule,
    GiftCertificatesModule,
    PaymentsModule,
    ReviewsModule,
    SupportTicketsModule,
    AdminModule,
    AnalyticsModule,
  ],
})
export class AppModule {}
