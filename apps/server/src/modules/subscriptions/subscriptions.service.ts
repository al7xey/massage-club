import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../subscription-plans/entities/subscription-plan.entity';
import { User } from '../users/entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { FreezeSubscriptionDto } from './dto/freeze-subscription.dto';
import { SubscriptionCredit } from './entities/subscription-credit.entity';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription) private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionCredit) private readonly creditsRepository: Repository<SubscriptionCredit>,
    @InjectRepository(SubscriptionPlan) private readonly plansRepository: Repository<SubscriptionPlan>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const plan = await this.plansRepository.findOneByOrFail({ id: dto.planId });
    const startsAt = new Date();
    const endsAt = new Date(startsAt);
    endsAt.setMonth(endsAt.getMonth() + 1);

    const subscription = await this.subscriptionsRepository.save(
      this.subscriptionsRepository.create({ user, plan, startsAt, endsAt, status: SubscriptionStatus.ACTIVE }),
    );

    await this.creditsRepository.save(
      this.creditsRepository.create({
        subscription,
        totalCredits: plan.includedCredits,
        remainingCredits: plan.includedCredits,
      }),
    );

    return subscription;
  }

  findMine(userId: string) {
    return this.subscriptionsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async freeze(userId: string, id: string, dto: FreezeSubscriptionDto) {
    const subscription = await this.findOwnedSubscription(userId, id);
    subscription.status = SubscriptionStatus.FROZEN;
    subscription.frozenUntil = new Date(dto.frozenUntil);
    return this.subscriptionsRepository.save(subscription);
  }

  async cancel(userId: string, id: string) {
    const subscription = await this.findOwnedSubscription(userId, id);
    subscription.status = SubscriptionStatus.CANCELLED;
    return this.subscriptionsRepository.save(subscription);
  }

  private async findOwnedSubscription(userId: string, id: string) {
    const subscription = await this.subscriptionsRepository.findOne({ where: { id } });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    if (subscription.user.id !== userId) {
      throw new ForbiddenException('Subscription belongs to another user');
    }
    return subscription;
  }
}
