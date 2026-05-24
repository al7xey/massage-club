import { applySubscriptionBenefits } from '@massage/shared';
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { MasterShift } from '../masters/entities/master-shift.entity';
import { Master } from '../masters/entities/master.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { SubscriptionCredit } from '../subscriptions/entities/subscription-credit.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  findMine(userId: string) {
    return this.cartRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const [user, service] = await Promise.all([
      this.usersRepository.findOneByOrFail({ id: userId }),
      this.servicesRepository.findOneByOrFail({ id: dto.serviceId }),
    ]);

    if (!user.isActive) {
      throw new ForbiddenException('Blocked users cannot add services to cart');
    }

    return this.cartRepository.save(this.cartRepository.create({ user, service }));
  }

  async removeItem(userId: string, id: string) {
    const item = await this.cartRepository.findOne({ where: { id, user: { id: userId } } });
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.delete(id);
    return { deleted: true };
  }

  async clear(userId: string) {
    await this.cartRepository.delete({ user: { id: userId } });
    return { cleared: true };
  }

  async checkout(userId: string, dto: CheckoutCartDto) {
    return this.dataSource.transaction(async (manager) => {
      const cartRepository = manager.getRepository(CartItem);
      const studioRepository = manager.getRepository(Studio);
      const masterRepository = manager.getRepository(Master);
      const subscriptionRepository = manager.getRepository(Subscription);
      const creditsRepository = manager.getRepository(SubscriptionCredit);
      const appointmentsRepository = manager.getRepository(Appointment);
      const paymentsRepository = manager.getRepository(Payment);
      const shiftsRepository = manager.getRepository(MasterShift);

      const cartItems = await cartRepository.find({
        where: { user: { id: userId } },
        order: { createdAt: 'ASC' },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      const cartUser = cartItems[0].user;
      if (!cartUser.isActive) {
        throw new ForbiddenException('Blocked users cannot create appointments');
      }

      const itemIds = dto.items.map((item) => item.cartItemId);
      const uniqueIds = new Set(itemIds);

      if (uniqueIds.size !== dto.items.length) {
        throw new BadRequestException('Duplicate checkout items are not allowed');
      }

      if (cartItems.length !== dto.items.length || cartItems.some((item) => !uniqueIds.has(item.id))) {
        throw new BadRequestException('Checkout items do not match current cart');
      }

      const studio = await studioRepository.findOneByOrFail({ id: dto.studioId });
      const activeSubscription = await subscriptionRepository.findOne({
        where: {
          user: { id: userId },
          status: SubscriptionStatus.ACTIVE,
          endsAt: MoreThan(new Date()),
        },
        order: { createdAt: 'DESC' },
      });

      const creditPool = activeSubscription
        ? await creditsRepository.find({
            where: {
              subscription: { id: activeSubscription.id },
              remainingCredits: MoreThan(0),
            },
            order: { id: 'ASC' },
          })
        : [];
      const remainingCredits = creditPool.reduce((sum, credit) => sum + credit.remainingCredits, 0);
      const pricingPlan = applySubscriptionBenefits(
        cartItems.map((item) => ({
          id: item.id,
          isIncludedInSubscription: isClassicMassage(item.service),
          priceRub: item.service.priceRub,
        })),
        {
          discountPercent: activeSubscription?.plan.discountPercent ?? 0,
          remainingCredits,
        },
      );
      const pricingByItemId = new Map(pricingPlan.items.map((item) => [item.id, item]));

      const configByItemId = new Map(dto.items.map((item) => [item.cartItemId, item]));
      const appointments: Appointment[] = [];
      const payments: Payment[] = [];
      let subscriptionCreditsUsed = 0;
      let totalAmountRub = 0;

      for (const cartItem of cartItems) {
        const config = configByItemId.get(cartItem.id);
        if (!config) {
          throw new BadRequestException('Missing checkout config for cart item');
        }

        const startsAt = new Date(config.startsAt);
        if (Number.isNaN(startsAt.getTime())) {
          throw new BadRequestException('Invalid appointment start time');
        }

        if (startsAt.toISOString().slice(0, 10) !== dto.date.slice(0, 10)) {
          throw new BadRequestException('Selected slot must match checkout date');
        }

        const master = await masterRepository.findOne({
          where: { id: config.masterId },
          relations: ['services'],
        });

        if (!master) {
          throw new NotFoundException('Master not found');
        }

        if (!masterWorksInStudio(master, studio.id)) {
          throw new BadRequestException('Master does not work in selected studio');
        }

        if (master.services.length > 0 && !master.services.some((service) => service.id === cartItem.service.id)) {
          throw new BadRequestException('Master does not provide selected service');
        }

        const endsAt = new Date(startsAt.getTime() + cartItem.service.durationMinutes * 60_000);
        await this.ensureSlotAvailable(appointmentsRepository, shiftsRepository, master.id, startsAt, endsAt);

        const pricing = pricingByItemId.get(cartItem.id);
        if (!pricing) {
          throw new BadRequestException('Missing pricing config for cart item');
        }

        let selectedCredit: SubscriptionCredit | undefined;
        if (pricing.paidBySubscriptionCredit) {
          selectedCredit = creditPool.find((credit) => credit.remainingCredits > 0);
          if (!selectedCredit) {
            throw new BadRequestException('No included visits available in active subscription');
          }

          selectedCredit.remainingCredits -= 1;
          subscriptionCreditsUsed += 1;
        }

        const appointment = await appointmentsRepository.save(
          appointmentsRepository.create({
            user: { id: userId } as User,
            service: cartItem.service,
            studio,
            master,
            startsAt,
            endsAt,
            priceRub: pricing.finalPriceRub,
            basePriceRub: cartItem.service.priceRub,
            discountPercent: pricing.discountPercent,
            paidBySubscriptionCredit: pricing.paidBySubscriptionCredit,
            status: AppointmentStatus.SCHEDULED,
          }),
        );

        appointments.push(appointment);

        if (!pricing.paidBySubscriptionCredit) {
          totalAmountRub += pricing.finalPriceRub;
          const payment = await paymentsRepository.save(
            paymentsRepository.create({
              user: { id: userId } as User,
              amountRub: pricing.finalPriceRub,
              purpose: `SERVICE:${cartItem.service.title}`,
              relatedEntityId: appointment.id,
              provider: 'mock',
              status: PaymentStatus.PAID,
            }),
          );
          payments.push(payment);
        }
      }

      if (creditPool.length > 0) {
        await creditsRepository.save(creditPool);
      }

      await cartRepository.delete({ id: In(cartItems.map((item) => item.id)) });

      return {
        appointments,
        payments,
        totalAmountRub,
        subscriptionCreditsUsed,
      };
    });
  }

  private async ensureSlotAvailable(
    appointmentsRepository: Repository<Appointment>,
    shiftsRepository: Repository<MasterShift>,
    masterId: string,
    startsAt: Date,
    endsAt: Date,
  ) {
    const shift = await shiftsRepository.findOne({
      where: {
        master: { id: masterId },
        isAvailable: true,
        startsAt: LessThanOrEqual(startsAt),
        endsAt: MoreThanOrEqual(endsAt),
      },
    });

    if (!shift) {
      throw new BadRequestException('Master is not available in selected time');
    }

    const conflict = await appointmentsRepository.findOne({
      where: {
        master: { id: masterId },
        status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        startsAt: LessThan(endsAt),
        endsAt: MoreThan(startsAt),
      },
    });

    if (conflict) {
      throw new BadRequestException('Master already has an appointment in this time slot');
    }
  }
}

function masterWorksInStudio(master: Master, studioId: string) {
  return Boolean(master.studio?.id === studioId || master.studios?.some((studio) => studio.id === studioId));
}

function isClassicMassage(service: Service) {
  const title = service.title.toLowerCase();
  const categorySlug = service.category?.slug ?? '';
  return categorySlug.includes('massage') && title.includes('классический');
}
