import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { MockCheckoutDto } from './dto/mock-checkout.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async mockCheckout(userId: string, dto: MockCheckoutDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    return this.paymentsRepository.save(
      this.paymentsRepository.create({
        user,
        amountRub: dto.amountRub,
        purpose: dto.purpose,
        relatedEntityId: dto.relatedEntityId,
        provider: 'mock',
        status: PaymentStatus.PAID,
      }),
    );
  }

  async findOne(id: string) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  findMine(userId: string) {
    return this.paymentsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.paymentsRepository.find({ order: { createdAt: 'DESC' } });
  }
}
