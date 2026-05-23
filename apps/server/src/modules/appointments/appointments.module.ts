import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Master } from '../masters/entities/master.entity';
import { MasterDateAvailability } from '../masters/entities/master-date-availability.entity';
import { MasterShift } from '../masters/entities/master-shift.entity';
import { MasterWeeklySchedule } from '../masters/entities/master-weekly-schedule.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { SubscriptionCredit } from '../subscriptions/entities/subscription-credit.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, User, Service, Studio, Master, MasterShift, MasterWeeklySchedule, MasterDateAvailability, Subscription, SubscriptionCredit, Payment])],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
