import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { MasterShift } from '../masters/entities/master-shift.entity';
import { Master } from '../masters/entities/master.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { Service } from '../services/entities/service.entity';
import { Studio } from '../studios/entities/studio.entity';
import { SubscriptionCredit } from '../subscriptions/entities/subscription-credit.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentSlotsQueryDto } from './dto/appointment-slots-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';

const SLOT_STEP_MINUTES = 30;

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Studio) private readonly studiosRepository: Repository<Studio>,
    @InjectRepository(Master) private readonly mastersRepository: Repository<Master>,
    @InjectRepository(MasterShift) private readonly shiftsRepository: Repository<MasterShift>,
    @InjectRepository(Subscription) private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionCredit) private readonly creditsRepository: Repository<SubscriptionCredit>,
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
  ) {}

  async create(userId: string, dto: CreateAppointmentDto) {
    const [user, service, studio, master] = await Promise.all([
      this.usersRepository.findOneByOrFail({ id: userId }),
      this.servicesRepository.findOneByOrFail({ id: dto.serviceId }),
      this.studiosRepository.findOneByOrFail({ id: dto.studioId }),
      this.mastersRepository.findOne({ where: { id: dto.masterId }, relations: ['services'] }),
    ]);

    if (!master) {
      throw new NotFoundException('Master not found');
    }

    if (!master.studio || master.studio.id !== studio.id) {
      throw new BadRequestException('Master does not work in selected studio');
    }

    if (!master.services.some((masterService) => masterService.id === service.id)) {
      throw new BadRequestException('Master does not provide selected service');
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);

    await this.ensureSlotAvailable(master.id, startsAt, endsAt);

    const activeSubscription = await this.findActiveSubscription(user.id);
    const credit = activeSubscription ? await this.findUsableCredit(activeSubscription.id) : null;
    const discountPercent = activeSubscription?.plan.discountPercent ?? 0;
    const discountedPrice = Math.round(service.priceRub * (1 - discountPercent / 100));
    const paidBySubscriptionCredit = Boolean(dto.useSubscriptionCredit);

    if (paidBySubscriptionCredit && !credit) {
      throw new BadRequestException('No included visits available in active subscription');
    }

    const appointment = await this.appointmentsRepository.save(
      this.appointmentsRepository.create({
        user,
        service,
        studio,
        master,
        startsAt,
        endsAt,
        priceRub: paidBySubscriptionCredit ? 0 : discountedPrice,
        basePriceRub: service.priceRub,
        discountPercent,
        paidBySubscriptionCredit,
        note: dto.note,
        status: AppointmentStatus.SCHEDULED,
      }),
    );

    if (paidBySubscriptionCredit && credit) {
      credit.remainingCredits -= 1;
      await this.creditsRepository.save(credit);
    } else {
      await this.paymentsRepository.save(
        this.paymentsRepository.create({
          user,
          amountRub: discountedPrice,
          purpose: `SERVICE:${service.title}`,
          relatedEntityId: appointment.id,
          provider: 'mock',
          status: PaymentStatus.PAID,
        }),
      );
    }

    return appointment;
  }

  findMine(userId: string) {
    return this.appointmentsRepository.find({
      where: { user: { id: userId } },
      order: { startsAt: 'DESC' },
    });
  }

  findAll() {
    return this.appointmentsRepository.find({ order: { startsAt: 'DESC' } });
  }

  async findSlots(query: AppointmentSlotsQueryDto) {
    const master = await this.mastersRepository.findOneByOrFail({ id: query.masterId });
    const dayStart = new Date(`${query.date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const appointmentDurationMinutes = query.durationMinutes ?? SLOT_STEP_MINUTES;

    const shifts = await this.shiftsRepository.find({
      where: {
        master: { id: master.id },
        isAvailable: true,
        startsAt: LessThan(dayEnd),
        endsAt: MoreThan(dayStart),
      },
      order: { startsAt: 'ASC' },
    });

    const appointments = await this.appointmentsRepository.find({
      where: {
        master: { id: master.id },
        status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        startsAt: LessThan(dayEnd),
        endsAt: MoreThan(dayStart),
      },
    });

    const slots = shifts.flatMap((shift) => buildSlots(shift.startsAt, shift.endsAt, appointmentDurationMinutes));
    const availableSlots = slots.filter((slot) => {
      const slotEnd = new Date(slot.getTime() + appointmentDurationMinutes * 60_000);
      return !appointments.some((appointment) => appointment.startsAt < slotEnd && appointment.endsAt > slot);
    });

    return availableSlots.map((slot) => slot.toISOString());
  }

  async cancel(userId: string, id: string) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    if (appointment.user.id !== userId) {
      throw new ForbiddenException('Appointment belongs to another user');
    }
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentsRepository.save(appointment);
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = status;
    return this.appointmentsRepository.save(appointment);
  }

  private async ensureSlotAvailable(masterId: string, startsAt: Date, endsAt: Date) {
    const shift = await this.shiftsRepository.findOne({
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

    const conflict = await this.appointmentsRepository.findOne({
      where: {
        master: { id: masterId },
        status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        startsAt: LessThan(endsAt),
        endsAt: MoreThan(startsAt),
      },
    });

    if (conflict) {
      throw new ConflictException('Master already has an appointment in this time slot');
    }
  }

  private findActiveSubscription(userId: string) {
    return this.subscriptionsRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
        endsAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  private findUsableCredit(subscriptionId: string) {
    return this.creditsRepository.findOne({
      where: {
        subscription: { id: subscriptionId },
        remainingCredits: MoreThan(0),
      },
    });
  }
}

function buildSlots(startsAt: Date, endsAt: Date, durationMinutes: number) {
  const slots: Date[] = [];
  const cursor = new Date(startsAt);
  const durationMs = durationMinutes * 60_000;

  while (cursor.getTime() + durationMs <= endsAt.getTime()) {
    slots.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + SLOT_STEP_MINUTES);
  }

  return slots;
}
