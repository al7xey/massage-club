import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { resolveSubscriptionPurchaseMode } from '@massage/shared';
import { MoreThan, Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
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
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async create(userId: string, dto: CreateSubscriptionDto) {
    const user = await this.usersRepository.findOneByOrFail({ id: userId });
    const plan = await this.plansRepository.findOneByOrFail({ id: dto.planId, isActive: true });
    const activeSubscription = await this.findCurrentActiveSubscription(user.id);
    const purchaseMode = resolveSubscriptionPurchaseMode(activeSubscription?.plan.id, plan.id);
    const startsAt = new Date();
    let subscription: Subscription;

    if (purchaseMode === 'EXTEND' && activeSubscription) {
      const nextEndsAt = new Date(activeSubscription.endsAt > startsAt ? activeSubscription.endsAt : startsAt);
      nextEndsAt.setMonth(nextEndsAt.getMonth() + 1);
      activeSubscription.endsAt = nextEndsAt;
      activeSubscription.status = SubscriptionStatus.ACTIVE;
      activeSubscription.frozenUntil = undefined;
      subscription = await this.subscriptionsRepository.save(activeSubscription);
    } else {
      if (activeSubscription) {
        await this.cancelActiveSubscriptions(user.id);
      }

      const endsAt = new Date(startsAt);
      endsAt.setMonth(endsAt.getMonth() + 1);
      subscription = await this.subscriptionsRepository.save(
        this.subscriptionsRepository.create({ user, plan, startsAt, endsAt, status: SubscriptionStatus.ACTIVE }),
      );
    }

    const credits = await this.upsertCredits(subscription, plan.includedCredits, purchaseMode === 'EXTEND');

    const payment = await this.paymentsRepository.save(
      this.paymentsRepository.create({
        user,
        amountRub: plan.monthlyPriceRub,
        purpose: `SUBSCRIPTION:${plan.name}`,
        relatedEntityId: subscription.id,
        provider: 'mock',
        status: PaymentStatus.PAID,
      }),
    );

    return {
      ...subscription,
      credits,
      payment,
      purchaseMode,
    };
  }

  findMine(userId: string) {
    return this.subscriptionsRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  findAll() {
    return this.subscriptionsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findActive(userId: string) {
    const subscription = await this.findCurrentActiveSubscription(userId);

    if (!subscription) {
      return null;
    }

    const credits = await this.findCredits(subscription.id);
    return { ...subscription, credits };
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

  private async cancelActiveSubscriptions(userId: string) {
    const activeSubscriptions = await this.subscriptionsRepository.find({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
        endsAt: MoreThan(new Date()),
      },
    });

    await Promise.all(
      activeSubscriptions.map((subscription) =>
        this.subscriptionsRepository.save({ ...subscription, status: SubscriptionStatus.CANCELLED }),
      ),
    );
  }

  private async findCurrentActiveSubscription(userId: string) {
    return this.subscriptionsRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
        endsAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  private findCredits(subscriptionId: string) {
    return this.creditsRepository.find({
      where: { subscription: { id: subscriptionId } },
      order: { id: 'ASC' },
    });
  }

  private async upsertCredits(subscription: Subscription, includedCredits: number, shouldAccumulate: boolean) {
    const existingCredits = await this.findCredits(subscription.id);

    if (existingCredits.length === 0) {
      return [
        await this.creditsRepository.save(
          this.creditsRepository.create({
            subscription,
            totalCredits: includedCredits,
            remainingCredits: includedCredits,
          }),
        ),
      ];
    }

    if (!shouldAccumulate) {
      return existingCredits;
    }

    const [primaryCredit, ...restCredits] = existingCredits;
    primaryCredit.totalCredits += includedCredits;
    primaryCredit.remainingCredits += includedCredits;
    await this.creditsRepository.save(primaryCredit);

    return [primaryCredit, ...restCredits];
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
