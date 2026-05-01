import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { GiftCertificate } from '../gift-certificates/entities/gift-certificate.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { AnalyticsSummary } from './types/analytics-summary.type';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Subscription) private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(GiftCertificate) private readonly certificatesRepository: Repository<GiftCertificate>,
  ) {}

  async getSummary(): Promise<AnalyticsSummary> {
    const [users, appointments, activeSubscriptions, giftCertificates, paidPayments] = await Promise.all([
      this.usersRepository.count(),
      this.appointmentsRepository.count(),
      this.subscriptionsRepository.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.certificatesRepository.count(),
      this.paymentsRepository.find({ where: { status: PaymentStatus.PAID } }),
    ]);

    return {
      users,
      appointments,
      activeSubscriptions,
      giftCertificates,
      paymentsRub: paidPayments.reduce((sum, payment) => sum + payment.amountRub, 0),
    };
  }
}
