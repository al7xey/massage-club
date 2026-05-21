import { applySubscriptionBenefits } from '@massage/shared';
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
import { AvailableMastersQueryDto } from './dto/available-masters-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServiceSlotsQueryDto } from './dto/service-slots-query.dto';
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
    const pricing = applySubscriptionBenefits(
      [{ id: service.id, isIncludedInSubscription: isClassicMassage(service), priceRub: service.priceRub }],
      {
        discountPercent: activeSubscription?.plan.discountPercent ?? 0,
        remainingCredits: credit ? 1 : 0,
      },
    ).items[0];

    const appointment = await this.appointmentsRepository.save(
      this.appointmentsRepository.create({
        user,
        service,
        studio,
        master,
        startsAt,
        endsAt,
        priceRub: pricing.finalPriceRub,
        basePriceRub: service.priceRub,
        discountPercent: pricing.discountPercent,
        paidBySubscriptionCredit: pricing.paidBySubscriptionCredit,
        note: dto.note,
        status: AppointmentStatus.SCHEDULED,
      }),
    );

    if (pricing.paidBySubscriptionCredit && credit) {
      credit.remainingCredits -= 1;
      await this.creditsRepository.save(credit);
    } else {
      await this.paymentsRepository.save(
        this.paymentsRepository.create({
          user,
          amountRub: pricing.finalPriceRub,
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

  async findServiceSlots(query: ServiceSlotsQueryDto) {
    const service = await this.servicesRepository.findOneByOrFail({ id: query.serviceId });
    await this.studiosRepository.findOneByOrFail({ id: query.studioId });
    const masters = await this.findEligibleMasters(query.studioId, service.id);

    if (masters.length === 0) {
      return [];
    }

    const dayStart = new Date(`${query.date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    const masterIds = masters.map((master) => master.id);

    const shifts = await this.shiftsRepository.find({
      where: {
        master: { id: In(masterIds) },
        isAvailable: true,
        startsAt: LessThan(dayEnd),
        endsAt: MoreThan(dayStart),
      },
      order: { startsAt: 'ASC' },
    });

    const appointments = await this.appointmentsRepository.find({
      where: {
        master: { id: In(masterIds) },
        status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        startsAt: LessThan(dayEnd),
        endsAt: MoreThan(dayStart),
      },
    });

    const availableSlots = new Set<string>();

    for (const shift of shifts) {
      const masterAppointments = appointments.filter((appointment) => appointment.master.id === shift.master.id);
      const slots = buildSlots(shift.startsAt, shift.endsAt, service.durationMinutes);

      for (const slot of slots) {
        const slotEnd = new Date(slot.getTime() + service.durationMinutes * 60_000);
        const hasConflict = masterAppointments.some((appointment) => appointment.startsAt < slotEnd && appointment.endsAt > slot);

        if (!hasConflict) {
          availableSlots.add(slot.toISOString());
        }
      }
    }

    return [...availableSlots].sort((left, right) => new Date(left).getTime() - new Date(right).getTime());
  }

  async findAvailableMasters(query: AvailableMastersQueryDto) {
    const [service] = await Promise.all([
      this.servicesRepository.findOneByOrFail({ id: query.serviceId }),
      this.studiosRepository.findOneByOrFail({ id: query.studioId }),
    ]);

    const startsAt = new Date(query.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      throw new BadRequestException('Invalid appointment start time');
    }

    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    const masters = await this.findEligibleMasters(query.studioId, service.id);

    if (masters.length === 0) {
      return [];
    }

    const masterIds = masters.map((master) => master.id);
    const shifts = await this.shiftsRepository.find({
      where: {
        master: { id: In(masterIds) },
        isAvailable: true,
        startsAt: LessThanOrEqual(startsAt),
        endsAt: MoreThanOrEqual(endsAt),
      },
    });
    const appointments = await this.appointmentsRepository.find({
      where: {
        master: { id: In(masterIds) },
        status: In([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        startsAt: LessThan(endsAt),
        endsAt: MoreThan(startsAt),
      },
    });

    return masters
      .filter((master) => {
        const hasShift = shifts.some((shift) => shift.master.id === master.id);
        const hasConflict = appointments.some((appointment) => appointment.master.id === master.id);
        return hasShift && !hasConflict;
      })
      .sort((left, right) => left.lastName.localeCompare(right.lastName) || left.firstName.localeCompare(right.firstName));
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

  private async findEligibleMasters(studioId: string, serviceId: string) {
    const masters = await this.mastersRepository.find({
      where: {
        isActive: true,
        studio: { id: studioId },
      },
      relations: ['services'],
      order: { lastName: 'ASC' },
    });

    return masters.filter((master) => master.services.some((service) => service.id === serviceId));
  }
}

function isClassicMassage(service: Service) {
  const title = service.title.toLowerCase();
  const categorySlug = service.category?.slug ?? '';
  return categorySlug.includes('massage') && title.includes('классический');
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
