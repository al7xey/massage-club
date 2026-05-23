import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { Appointment } from '../appointments/entities/appointment.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { GiftCertificatesModule } from '../gift-certificates/gift-certificates.module';
import { MasterShift } from '../masters/entities/master-shift.entity';
import { MasterDateAvailability } from '../masters/entities/master-date-availability.entity';
import { MasterWeeklySchedule } from '../masters/entities/master-weekly-schedule.entity';
import { Master } from '../masters/entities/master.entity';
import { MastersModule } from '../masters/masters.module';
import { PaymentsModule } from '../payments/payments.module';
import { Service } from '../services/entities/service.entity';
import { ServicesModule } from '../services/services.module';
import { Studio } from '../studios/entities/studio.entity';
import { StudiosModule } from '../studios/studios.module';
import { SubscriptionPlansModule } from '../subscription-plans/subscription-plans.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { SystemSetting } from './entities/system-setting.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SettingsController } from './settings.controller';
import { SuperAdminController } from './super-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemSetting, User, Master, MasterShift, MasterWeeklySchedule, MasterDateAvailability, Studio, Service, Appointment]),
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
    AuditLogModule,
  ],
  controllers: [AdminController, SuperAdminController, SettingsController],
  providers: [AdminService],
})
export class AdminModule {}
