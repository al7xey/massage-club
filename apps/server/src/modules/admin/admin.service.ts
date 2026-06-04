import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { AnalyticsService } from '../analytics/analytics.service';
import { Appointment, AppointmentStatus } from '../appointments/entities/appointment.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateGiftCertificateDto } from '../gift-certificates/dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from '../gift-certificates/dto/update-gift-certificate.dto';
import { GiftCertificatesService } from '../gift-certificates/gift-certificates.service';
import { CreateMasterShiftDto } from '../masters/dto/create-master-shift.dto';
import { CreateMasterDateAvailabilityDto, UpdateMasterDateAvailabilityDto } from '../masters/dto/master-date-availability.dto';
import { PutWeeklyScheduleDto, WeeklyScheduleIntervalDto } from '../masters/dto/master-weekly-schedule.dto';
import { CreateMasterDto } from '../masters/dto/create-master.dto';
import { UpdateMasterShiftDto } from '../masters/dto/update-master-shift.dto';
import { UpdateMasterDto } from '../masters/dto/update-master.dto';
import { MasterDateAvailability, MasterDateAvailabilityStatus } from '../masters/entities/master-date-availability.entity';
import { MasterShift } from '../masters/entities/master-shift.entity';
import { MasterWeeklySchedule } from '../masters/entities/master-weekly-schedule.entity';
import { Master } from '../masters/entities/master.entity';
import { MastersService } from '../masters/masters.service';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { UpdateServiceDto } from '../services/dto/update-service.dto';
import { Service } from '../services/entities/service.entity';
import { ServicesService } from '../services/services.service';
import { CreateStudioDto } from '../studios/dto/create-studio.dto';
import { UpdateStudioDto } from '../studios/dto/update-studio.dto';
import { Studio } from '../studios/entities/studio.entity';
import { StudiosService } from '../studios/studios.service';
import { SupportTicket, SupportTicketStatus } from '../support-tickets/entities/support-ticket.entity';
import { CreateSubscriptionPlanDto } from '../subscription-plans/dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from '../subscription-plans/dto/update-subscription-plan.dto';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CancelAdminAppointmentDto } from './dto/cancel-admin-appointment.dto';
import { CreateAdminAppointmentDto } from './dto/create-admin-appointment.dto';
import { MembershipEntryFeeSettingDto, UpdateMembershipEntryFeeDto } from './dto/update-membership-entry-fee.dto';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';
import { SystemSetting } from './entities/system-setting.entity';

const membershipEntryFeeKey = 'membershipEntryFee';
const activeAppointmentStatuses = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED];
const defaultMembershipEntryFee: MembershipEntryFeeSettingDto = {
  entryFeeRub: 1200,
  entryFeeEnabled: false,
};
const networkSettingsKey = 'networkSettings';
const defaultNetworkSettings = {
  networkName: 'RelaxUp',
  primaryColor: '#6f8d4e',
  contactEmail: 'hello@relaxup.local',
  supportPhone: '+7 999 000-00-00',
  defaultWorkingHours: '10:00-22:00',
  scheduleStepMinutes: 30,
  defaultAppointmentDurationMinutes: 60,
  minAppointmentDurationMinutes: 5,
  maxAppointmentDurationMinutes: 180,
  allowCustomAppointmentDuration: true,
  cancellationRules: 'Отмена без штрафа за 12 часов до визита.',
  certificateValidityDays: 365,
  defaultAppointmentStatus: AppointmentStatus.SCHEDULED,
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SystemSetting) private readonly settingsRepository: Repository<SystemSetting>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(Master) private readonly mastersRepository: Repository<Master>,
    @InjectRepository(MasterShift) private readonly shiftsRepository: Repository<MasterShift>,
    @InjectRepository(MasterWeeklySchedule) private readonly weeklySchedulesRepository: Repository<MasterWeeklySchedule>,
    @InjectRepository(MasterDateAvailability) private readonly dateAvailabilityRepository: Repository<MasterDateAvailability>,
    @InjectRepository(Studio) private readonly studiosRepository: Repository<Studio>,
    @InjectRepository(Service) private readonly servicesRepository: Repository<Service>,
    @InjectRepository(Appointment) private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Payment) private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Subscription) private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(SupportTicket) private readonly ticketsRepository: Repository<SupportTicket>,
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
    private readonly servicesService: ServicesService,
    private readonly studiosService: StudiosService,
    private readonly mastersService: MastersService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly giftCertificatesService: GiftCertificatesService,
    private readonly paymentsService: PaymentsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getDashboard(actor?: JwtUserPayload) {
    const todayStart = startOfMoscowDay(new Date());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const appointmentStudioWhere = visibleStudioIds ? { studio: { id: In(visibleStudioIds) } } : {};
    const scopedMasters = await this.getMasters({}, actor);
    const [activeStudios, todayAppointments, cancelledToday, shiftsToday, conflicts, openRequests, certificates, paidPayments, activeSubscriptions] =
      await Promise.all([
        this.safeDashboardValue(
          visibleStudioIds
            ? this.studiosRepository.count({ where: { id: In(visibleStudioIds), isActive: true } })
            : this.studiosRepository.count({ where: { isActive: true } }),
          0,
        ),
        this.safeDashboardValue(
          this.appointmentsRepository.count({
            where: {
              ...appointmentStudioWhere,
              status: In(activeAppointmentStatuses),
              startsAt: MoreThan(todayStart),
              endsAt: LessThan(tomorrowStart),
            },
          }),
          0,
        ),
        this.safeDashboardValue(
          this.appointmentsRepository.count({
            where: {
              ...appointmentStudioWhere,
              status: AppointmentStatus.CANCELLED,
              startsAt: MoreThan(todayStart),
              endsAt: LessThan(tomorrowStart),
            },
          }),
          0,
        ),
        this.safeDashboardValue(
          this.shiftsRepository.count({
            where: {
              ...(visibleStudioIds ? { studio: { id: In(visibleStudioIds) } } : {}),
              isAvailable: true,
              startsAt: LessThan(tomorrowStart),
              endsAt: MoreThan(todayStart),
            },
          }),
          0,
        ),
        this.safeDashboardValue(this.countScheduleConflicts(visibleStudioIds), 0),
        this.safeDashboardValue(this.ticketsRepository.count({ where: { status: In([SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS]) } }), 0),
        this.safeDashboardValue(this.getGiftCertificates(actor), []),
        this.safeDashboardValue(this.paymentsRepository.find({ where: { status: PaymentStatus.PAID }, order: { createdAt: 'DESC' } }), []),
        this.safeDashboardValue(this.subscriptionsRepository.count({ where: { status: SubscriptionStatus.ACTIVE } }), 0),
      ]);

    const revenueRub = paidPayments.reduce((sum, payment) => sum + payment.amountRub, 0);
    const expiringCertificates = certificates.filter((certificate) => certificate.status === 'ACTIVE' && new Date(certificate.expiresAt) < addDays(new Date(), 14));

    return {
      masters: scopedMasters.length,
      activeMasters: scopedMasters.filter((master) => master.isActive).length,
      activeStudios,
      todayAppointments,
      scheduleConflicts: conflicts,
      freeWindowsToday: Math.max(shiftsToday * 4 - todayAppointments, 0),
      cancellationsToday: cancelledToday,
      pendingRequests: openRequests,
      certificatesToReview: expiringCertificates.length,
      revenueRub,
      activeSubscriptions,
    };
  }

  getAppointments() {
    return this.appointmentsRepository.find({ order: { startsAt: 'DESC' } });
  }

  getUsers() {
    return this.usersService.findAll();
  }

  getAnalyticsSummary() {
    return this.analyticsService.getSummary();
  }

  async getMembershipEntryFee(): Promise<MembershipEntryFeeSettingDto> {
    const setting = await this.settingsRepository.findOne({ where: { key: membershipEntryFeeKey } });
    if (!setting || typeof setting.value !== 'object' || setting.value === null) {
      return defaultMembershipEntryFee;
    }

    const value = setting.value as Partial<MembershipEntryFeeSettingDto>;
    return {
      entryFeeRub: typeof value.entryFeeRub === 'number' ? value.entryFeeRub : defaultMembershipEntryFee.entryFeeRub,
      entryFeeEnabled:
        typeof value.entryFeeEnabled === 'boolean' ? value.entryFeeEnabled : defaultMembershipEntryFee.entryFeeEnabled,
    };
  }

  async updateMembershipEntryFee(dto: UpdateMembershipEntryFeeDto) {
    const current = await this.getMembershipEntryFee();
    const next: MembershipEntryFeeSettingDto = {
      entryFeeRub: dto.entryFeeRub ?? current.entryFeeRub,
      entryFeeEnabled: dto.entryFeeEnabled ?? current.entryFeeEnabled,
    };
    const existing = await this.settingsRepository.findOne({ where: { key: membershipEntryFeeKey } });

    if (existing) {
      existing.value = next;
      await this.settingsRepository.save(existing);
      return next;
    }

    await this.settingsRepository.save(this.settingsRepository.create({ key: membershipEntryFeeKey, value: next }));
    return next;
  }

  getServices() {
    return this.servicesService.findAdminAll();
  }

  async getService(id: string) {
    return this.servicesService.findAdminOne(id);
  }

  async createService(dto: CreateServiceDto, actor?: JwtUserPayload) {
    const saved = await this.servicesService.create(dto);
    await this.audit(actor, 'CREATE_SERVICE', 'service', saved.id, null, snapshotService(saved));
    return saved;
  }

  async updateService(id: string, dto: UpdateServiceDto, actor?: JwtUserPayload) {
    const before = snapshotService(await this.servicesService.findAdminOne(id));
    const saved = await this.servicesService.update(id, dto);
    await this.audit(actor, 'UPDATE_SERVICE', 'service', saved.id, before, snapshotService(saved));
    return saved;
  }

  async updateServicePhoto(id: string, imageUrl: string, actor?: JwtUserPayload) {
    const before = snapshotService(await this.servicesService.findAdminOne(id));
    const saved = await this.servicesService.update(id, { imageUrl });
    await this.audit(actor, 'UPDATE_SERVICE_PHOTO', 'service', saved.id, before, snapshotService(saved));
    return saved;
  }

  async updateServiceGallery(id: string, galleryUrls: string[], actor?: JwtUserPayload) {
    const before = snapshotService(await this.servicesService.findAdminOne(id));
    const saved = await this.servicesService.update(id, { galleryUrls });
    await this.audit(actor, 'UPDATE_SERVICE_GALLERY', 'service', saved.id, before, snapshotService(saved));
    return saved;
  }

  async removeService(id: string, actor?: JwtUserPayload) {
    const before = snapshotService(await this.servicesService.findAdminOne(id));
    const saved = await this.servicesService.remove(id);
    await this.audit(actor, 'DEACTIVATE_SERVICE', 'service', saved.id, before, snapshotService(saved));
    return saved;
  }

  async getStudios(actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    if (!visibleStudioIds) {
      return this.studiosService.findAll();
    }
    if (visibleStudioIds.length === 0) {
      return [];
    }
    return this.studiosRepository.find({ where: { id: In(visibleStudioIds) }, order: { name: 'ASC' } });
  }

  createStudio(dto: CreateStudioDto) {
    return this.studiosService.create(dto);
  }

  updateStudio(id: string, dto: UpdateStudioDto) {
    return this.studiosService.update(id, dto);
  }

  removeStudio(id: string) {
    return this.studiosService.remove(id);
  }

  async getMasters(filters: { search?: string; studioId?: string } = {}, actor?: JwtUserPayload) {
    const masters = await this.mastersRepository.find({ order: { lastName: 'ASC', firstName: 'ASC' } });
    const search = filters.search?.trim().toLowerCase();
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);

    return masters.filter((master) => {
      const fullName = `${master.firstName} ${master.lastName}`.toLowerCase();
      const studioIds = getMasterStudioIds(master);
      const matchesSearch = !search || fullName.includes(search) || master.phone?.toLowerCase().includes(search);
      const matchesStudio = !filters.studioId || studioIds.includes(filters.studioId);
      const matchesScope = !visibleStudioIds || studioIds.some((studioId) => visibleStudioIds.includes(studioId));
      return matchesSearch && matchesStudio && matchesScope;
    });
  }

  async getMaster(id: string) {
    return this.findMaster(id);
  }

  async createMaster(dto: CreateMasterDto, actor?: JwtUserPayload) {
    await this.ensureActorCanAccessStudios(dto.studioIds ?? (dto.studioId ? [dto.studioId] : []), actor);
    const master = this.mastersRepository.create();
    await this.applyMasterDto(master, dto, true);
    const saved = await this.mastersRepository.save(master);
    await this.audit(actor, 'CREATE_MASTER', 'master', saved.id, null, snapshotMaster(saved));
    return saved;
  }

  async updateMaster(id: string, dto: UpdateMasterDto, actor?: JwtUserPayload) {
    const master = await this.findMaster(id);
    await this.ensureActorCanAccessMaster(master, actor);
    await this.ensureActorCanAccessStudios(dto.studioIds ?? (dto.studioId ? [dto.studioId] : []), actor);
    const before = snapshotMaster(master);
    await this.applyMasterDto(master, dto, false);
    const saved = await this.mastersRepository.save(master);
    await this.audit(actor, 'UPDATE_MASTER', 'master', saved.id, before, snapshotMaster(saved));
    return saved;
  }

  async updateMasterStudios(id: string, studioIds: string[], actor?: JwtUserPayload) {
    if (studioIds.length === 0) {
      throw new BadRequestException('Master must be assigned to at least one studio');
    }

    const master = await this.findMaster(id);
    await this.ensureActorCanAccessMaster(master, actor);
    await this.ensureActorCanAccessStudios(studioIds, actor);
    const before = snapshotMaster(master);
    const nextStudios = await this.findStudiosByIds(studioIds);
    const nextStudioIdSet = new Set(nextStudios.map((studio) => studio.id));
    const activeShifts = await this.shiftsRepository.find({
      where: { master: { id }, isAvailable: true },
    });
    const detachedShift = activeShifts.find((shift) => !nextStudioIdSet.has(shift.studio.id));

    if (detachedShift) {
      throw new ConflictException('Cannot detach studio while master has active shifts there');
    }

    master.studios = nextStudios;
    master.studio = nextStudios[0];
    const saved = await this.mastersRepository.save(master);
    await this.audit(actor, 'UPDATE_MASTER_STUDIOS', 'master', saved.id, before, snapshotMaster(saved));
    return saved;
  }

  async updateMasterServices(id: string, serviceIds: string[], actor?: JwtUserPayload) {
    const master = await this.findMaster(id);
    await this.ensureActorCanAccessMaster(master, actor);
    const before = snapshotMaster(master);
    master.services = serviceIds.length > 0 ? await this.findServicesByIds(serviceIds) : [];
    const saved = await this.mastersRepository.save(master);
    await this.audit(actor, 'UPDATE_MASTER_SERVICES', 'master', saved.id, before, snapshotMaster(saved));
    return saved;
  }

  async updateMasterPhoto(id: string, photoUrl?: string | null, actor?: JwtUserPayload) {
    const master = await this.findMaster(id);
    await this.ensureActorCanAccessMaster(master, actor);
    const before = snapshotMaster(master);
    master.photoUrl = photoUrl ? photoUrl.trim() : null;
    master.photoUrls = normalizePhotoUrls(master.photoUrls, master.photoUrl);
    const saved = await this.mastersRepository.save(master);
    await this.audit(actor, 'UPDATE_MASTER_PHOTO', 'master', saved.id, before, snapshotMaster(saved));
    return saved;
  }

  async removeMaster(id: string, actor?: JwtUserPayload) {
    const master = await this.findMaster(id);
    await this.ensureActorCanAccessMaster(master, actor);
    const before = snapshotMaster(master);
    await this.mastersRepository.softDelete(id);
    await this.audit(actor, 'DELETE_MASTER', 'master', id, before, null);
    return { deleted: true, id };
  }

  async getWeeklySchedule(masterId: string, actor?: JwtUserPayload) {
    return { days: await this.getWeeklyScheduleDays(masterId, actor) };
  }

  private async getWeeklyScheduleDays(masterId: string, actor?: JwtUserPayload) {
    const master = await this.findMaster(masterId);
    await this.ensureActorCanAccessMaster(master, actor);
    const rows = await this.weeklySchedulesRepository.find({
      where: { master: { id: masterId } },
      order: { dayOfWeek: 'ASC', intervalIndex: 'ASC' },
    });
    return buildWeeklyScheduleResponse(rows);
  }

  async updateWeeklySchedule(masterId: string, dto: PutWeeklyScheduleDto, actor?: JwtUserPayload) {
    const master = await this.findMaster(masterId);
    await this.ensureActorCanAccessMaster(master, actor);
    const before = await this.getWeeklyScheduleDays(masterId, actor);
    const rows: MasterWeeklySchedule[] = [];

    for (const day of dto.days) {
      const intervals = day.isWorking === false ? [] : day.intervals;
      validateIntervals(intervals);
      for (const [index, interval] of intervals.entries()) {
        const studio = await this.findStudio(interval.studioId);
        if (!getMasterStudioIds(master).includes(studio.id)) {
          throw new BadRequestException('Master is not assigned to selected studio');
        }
        await this.ensureActorCanAccessStudios([studio.id], actor);
        rows.push(
          this.weeklySchedulesRepository.create({
            master,
            studio,
            dayOfWeek: day.dayOfWeek,
            intervalIndex: interval.intervalIndex ?? index,
            isWorking: interval.isWorking ?? true,
            startTime: interval.startTime,
            endTime: interval.endTime,
            breakStartTime: interval.breakStartTime ?? null,
            breakEndTime: interval.breakEndTime ?? null,
          }),
        );
      }
    }

    await this.weeklySchedulesRepository
      .createQueryBuilder()
      .delete()
      .where('master_id = :masterId', { masterId })
      .execute();
    await this.weeklySchedulesRepository.save(rows);
    const next = await this.getWeeklyScheduleDays(masterId, actor);
    const warnings = await this.findScheduleChangeWarnings(masterId);
    await this.audit(actor, 'UPDATE_WEEKLY_SCHEDULE', 'master', masterId, { days: before }, { days: next, warnings });
    return { days: next, warnings };
  }

  async getDateAvailability(masterId: string, filters: { from?: string; to?: string } = {}) {
    await this.findMaster(masterId);
    const builder = this.dateAvailabilityRepository
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.master', 'master')
      .leftJoinAndSelect('availability.studio', 'studio')
      .where('master.id = :masterId', { masterId })
      .orderBy('availability.date', 'ASC')
      .addOrderBy('availability.startTime', 'ASC');

    if (filters.from) builder.andWhere('availability.date >= :from', { from: filters.from.slice(0, 10) });
    if (filters.to) builder.andWhere('availability.date <= :to', { to: filters.to.slice(0, 10) });
    return builder.getMany();
  }

  async createDateAvailability(masterId: string, dto: CreateMasterDateAvailabilityDto, actor?: JwtUserPayload) {
    const master = await this.findMaster(masterId);
    await this.ensureDateAvailabilityCanBeSaved(master, dto);
    const studio = dto.studioId ? await this.findStudio(dto.studioId) : null;
    const saved = await this.dateAvailabilityRepository.save(
      this.dateAvailabilityRepository.create({
        master,
        studio,
        date: dto.date.slice(0, 10),
        status: dto.status,
        startTime: dto.startTime ?? null,
        endTime: dto.endTime ?? null,
        reason: dto.reason ?? null,
      }),
    );
    await this.audit(actor, 'CREATE_DATE_AVAILABILITY', 'master_date_availability', saved.id, null, snapshotAvailability(saved));
    return saved;
  }

  async updateDateAvailability(masterId: string, availabilityId: string, dto: UpdateMasterDateAvailabilityDto, actor?: JwtUserPayload) {
    const master = await this.findMaster(masterId);
    const availability = await this.dateAvailabilityRepository.findOne({ where: { id: availabilityId, master: { id: masterId } } });
    if (!availability) {
      throw new NotFoundException('Date availability not found');
    }
    const before = snapshotAvailability(availability);
    const nextDto = {
      date: dto.date ?? availability.date,
      status: dto.status ?? availability.status,
      studioId: dto.studioId ?? availability.studio?.id,
      startTime: dto.startTime ?? availability.startTime ?? undefined,
      endTime: dto.endTime ?? availability.endTime ?? undefined,
      reason: dto.reason ?? availability.reason ?? undefined,
    };
    await this.ensureDateAvailabilityCanBeSaved(master, nextDto, availabilityId);
    availability.date = nextDto.date.slice(0, 10);
    availability.status = nextDto.status;
    availability.studio = nextDto.studioId ? await this.findStudio(nextDto.studioId) : null;
    availability.startTime = nextDto.startTime ?? null;
    availability.endTime = nextDto.endTime ?? null;
    availability.reason = nextDto.reason ?? null;
    const saved = await this.dateAvailabilityRepository.save(availability);
    await this.audit(actor, 'UPDATE_DATE_AVAILABILITY', 'master_date_availability', saved.id, before, snapshotAvailability(saved));
    return saved;
  }

  async removeDateAvailability(masterId: string, availabilityId: string, actor?: JwtUserPayload) {
    const availability = await this.dateAvailabilityRepository.findOne({ where: { id: availabilityId, master: { id: masterId } } });
    if (!availability) {
      throw new NotFoundException('Date availability not found');
    }
    const before = snapshotAvailability(availability);
    await this.dateAvailabilityRepository.delete({ id: availabilityId });
    await this.audit(actor, 'DELETE_DATE_AVAILABILITY', 'master_date_availability', availabilityId, before, null);
    return { deleted: true };
  }

  async getScheduleOverview(
    filters: { from?: string; to?: string; studioId?: string; masterId?: string; serviceId?: string } = {},
    actor?: JwtUserPayload,
  ) {
    const from = filters.from ? parseMoscowDateTime(filters.from.slice(0, 10), '00:00') : startOfMoscowDay(new Date());
    const to = filters.to ? parseMoscowDateTime(filters.to.slice(0, 10), '23:59') : addDays(from, 7);
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const scopedStudioIds = this.applyStudioFilter(visibleStudioIds, filters.studioId);
    const masterWhere: Record<string, unknown> = {};
    if (filters.masterId) masterWhere.id = filters.masterId;
    const masters = await this.mastersRepository.find({ where: masterWhere, order: { lastName: 'ASC', firstName: 'ASC' } });
    const masterIds = masters
      .filter((master) => !scopedStudioIds || getMasterStudioIds(master).some((studioId) => scopedStudioIds.includes(studioId)))
      .map((master) => master.id);
    const shifts = masterIds.length
      ? await this.shiftsRepository.find({
          where: {
            master: { id: In(masterIds) },
            ...(scopedStudioIds ? { studio: { id: In(scopedStudioIds) } } : {}),
            startsAt: LessThan(to),
            endsAt: MoreThan(from),
          },
          order: { startsAt: 'ASC' },
        })
      : [];
    const appointments = masterIds.length
      ? await this.appointmentsRepository.find({
          where: {
            master: { id: In(masterIds) },
            ...(scopedStudioIds ? { studio: { id: In(scopedStudioIds) } } : {}),
            ...(filters.serviceId ? { service: { id: filters.serviceId } } : {}),
            startsAt: LessThan(to),
            endsAt: MoreThan(from),
          },
          order: { startsAt: 'ASC' },
        })
      : [];

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      masters: masters.filter((master) => masterIds.includes(master.id)),
      shifts,
      appointments,
    };
  }

  getScheduleDay(filters: { date?: string; studioId?: string; masterId?: string; serviceId?: string } = {}, actor?: JwtUserPayload) {
    const date = filters.date ?? new Date().toISOString().slice(0, 10);
    return this.getScheduleOverview({ ...filters, from: date, to: date }, actor);
  }

  getScheduleWeek(filters: { startDate?: string; studioId?: string; masterId?: string; serviceId?: string } = {}, actor?: JwtUserPayload) {
    const from = filters.startDate ?? new Date().toISOString().slice(0, 10);
    const to = addDays(parseMoscowDateTime(from, '00:00'), 7).toISOString().slice(0, 10);
    return this.getScheduleOverview({ ...filters, from, to }, actor);
  }

  getScheduleMonth(filters: { month?: string; studioId?: string; masterId?: string; serviceId?: string } = {}, actor?: JwtUserPayload) {
    const month = filters.month ?? new Date().toISOString().slice(0, 7);
    const from = `${month}-01`;
    const start = parseMoscowDateTime(from, '00:00');
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);
    return this.getScheduleOverview({ ...filters, from, to: end.toISOString().slice(0, 10) }, actor);
  }

  async getMasterShifts(filters: { masterId?: string; studioId?: string; date?: string } = {}, actor?: JwtUserPayload) {
    const where: Record<string, unknown> = {};
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const scopedStudioIds = this.applyStudioFilter(visibleStudioIds, filters.studioId);
    if (filters.masterId) where.master = { id: filters.masterId };
    if (scopedStudioIds) where.studio = { id: In(scopedStudioIds) };

    if (filters.date) {
      const dayStart = parseMoscowDateTime(filters.date, '00:00');
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      return this.shiftsRepository.find({
        where: {
          ...where,
          startsAt: LessThan(dayEnd),
          endsAt: MoreThan(dayStart),
        },
        order: { startsAt: 'ASC' },
      });
    }

    return this.shiftsRepository.find({ where, order: { startsAt: 'ASC' } });
  }

  async createMasterShift(dto: CreateMasterShiftDto, actor?: JwtUserPayload) {
    const { startsAt, endsAt } = resolveShiftDates(dto);
    const [master, studio] = await Promise.all([this.findMaster(dto.masterId), this.findStudio(dto.studioId)]);
    await this.ensureActorCanAccessMaster(master, actor);
    await this.ensureActorCanAccessStudios([studio.id], actor);
    await this.ensureShiftCanBeSaved({ master, studio, startsAt, endsAt, isAvailable: dto.isAvailable ?? true });
    const shift = await this.shiftsRepository.save(
      this.shiftsRepository.create({
        master,
        studio,
        startsAt,
        endsAt,
        isAvailable: dto.isAvailable ?? true,
      }),
    );
    await this.audit(actor, 'CREATE_SHIFT', 'master_shift', shift.id, null, snapshotShift(shift));
    return shift;
  }

  async updateMasterShift(id: string, dto: UpdateMasterShiftDto, actor?: JwtUserPayload) {
    const shift = await this.shiftsRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const before = snapshotShift(shift);
    const nextMaster = dto.masterId ? await this.findMaster(dto.masterId) : shift.master;
    const nextStudio = dto.studioId ? await this.findStudio(dto.studioId) : shift.studio;
    await this.ensureActorCanAccessMaster(shift.master, actor);
    await this.ensureActorCanAccessMaster(nextMaster, actor);
    await this.ensureActorCanAccessStudios([nextStudio.id], actor);
    const nextDates = resolveShiftDates(dto, shift);
    const nextIsAvailable = dto.isAvailable ?? shift.isAvailable;
    await this.ensureShiftCanBeSaved({
      master: nextMaster,
      studio: nextStudio,
      startsAt: nextDates.startsAt,
      endsAt: nextDates.endsAt,
      isAvailable: nextIsAvailable,
      excludeShiftId: id,
    });
    await this.ensureShiftChangeKeepsAppointmentsInside(id, nextMaster.id, nextDates.startsAt, nextDates.endsAt, nextIsAvailable);

    shift.master = nextMaster;
    shift.studio = nextStudio;
    shift.startsAt = nextDates.startsAt;
    shift.endsAt = nextDates.endsAt;
    shift.isAvailable = nextIsAvailable;

    const saved = await this.shiftsRepository.save(shift);
    await this.audit(actor, 'UPDATE_SHIFT', 'master_shift', saved.id, before, snapshotShift(saved));
    return saved;
  }

  async removeMasterShift(id: string, actor?: JwtUserPayload) {
    const shift = await this.shiftsRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    await this.ensureActorCanAccessMaster(shift.master, actor);
    await this.ensureShiftHasNoActiveAppointments(shift);
    const before = snapshotShift(shift);
    shift.isAvailable = false;
    const saved = await this.shiftsRepository.save(shift);
    await this.audit(actor, 'DEACTIVATE_SHIFT', 'master_shift', saved.id, before, snapshotShift(saved));
    return { deleted: true, shift: saved };
  }

  getSubscriptionPlans() {
    return this.subscriptionPlansService.findAll();
  }

  async getSubscriptions(actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    if (!visibleStudioIds) {
      return this.subscriptionsService.findAll();
    }
    const userIds = await this.findClientIdsForStudios(visibleStudioIds);
    return userIds.length
      ? this.subscriptionsRepository.find({ where: { user: { id: In(userIds) } }, order: { createdAt: 'DESC' } })
      : [];
  }

  createSubscriptionPlan(dto: CreateSubscriptionPlanDto) {
    return this.subscriptionPlansService.create(dto);
  }

  updateSubscriptionPlan(id: string, dto: UpdateSubscriptionPlanDto) {
    return this.subscriptionPlansService.update(id, dto);
  }

  removeSubscriptionPlan(id: string) {
    return this.subscriptionPlansService.remove(id);
  }

  async getGiftCertificates(actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const certificates = await this.giftCertificatesService.findAll();
    if (!visibleStudioIds) {
      return certificates;
    }
    const userIds = new Set(await this.findClientIdsForStudios(visibleStudioIds));
    return certificates.filter((certificate) => certificate.buyer?.id && userIds.has(certificate.buyer.id));
  }

  async getPayments(actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    if (!visibleStudioIds) {
      return this.paymentsService.findAll();
    }
    const userIds = await this.findClientIdsForStudios(visibleStudioIds);
    return userIds.length ? this.paymentsRepository.find({ where: { user: { id: In(userIds) } }, order: { createdAt: 'DESC' } }) : [];
  }

  createGiftCertificate(dto: CreateGiftCertificateDto) {
    return this.giftCertificatesService.createAdmin(dto);
  }

  updateGiftCertificate(id: string, dto: UpdateGiftCertificateDto) {
    return this.giftCertificatesService.update(id, dto);
  }

  removeGiftCertificate(id: string) {
    return this.giftCertificatesService.remove(id);
  }

  async blockUser(id: string, actor: JwtUserPayload) {
    if (id === actor.sub) {
      throw new ForbiddenException('You cannot block yourself');
    }

    const user = await this.findUser(id);
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Blocking another super administrator requires an out-of-band approval');
    }

    const before = snapshotUser(user);
    user.isActive = false;
    const saved = await this.usersRepository.save(user);
    await this.audit(actor, 'BLOCK_USER', 'user', saved.id, before, snapshotUser(saved));
    return this.toAdminUser(saved);
  }

  async unblockUser(id: string, actor: JwtUserPayload) {
    const user = await this.findUser(id);
    const before = snapshotUser(user);
    user.isActive = true;
    const saved = await this.usersRepository.save(user);
    await this.audit(actor, 'UNBLOCK_USER', 'user', saved.id, before, snapshotUser(saved));
    return this.toAdminUser(saved);
  }

  async deleteUser(id: string, actor: JwtUserPayload) {
    if (id === actor.sub) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    const user = await this.findUser(id);
    if (user.role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Deleting another super administrator requires an out-of-band approval');
    }

    const before = snapshotUser(user);
    user.isActive = false;
    user.fullName = 'Удаленный пользователь';
    user.email = user.email ? `deleted-${user.id}@deleted.local` : null;
    user.phone = null;
    user.avatarUrl = null;
    user.passwordHash = `deleted-${randomUUID()}`;
    await this.usersRepository.save(user);
    await this.usersRepository.softDelete(id);
    await this.audit(actor, 'DELETE_USER', 'user', id, before, null);
    return { deleted: true, id };
  }

  async getUser(id: string) {
    return this.toAdminUser(await this.findUser(id));
  }

  async getSuperAdminUsers(filters: { search?: string; status?: string } = {}, actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const allUsers = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    const activeSubscriptions = await this.subscriptionsRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      order: { endsAt: 'DESC' },
    });
    let users = allUsers;
    const search = filters.search?.trim().toLowerCase();

    if (visibleStudioIds) {
      const appointments = await this.appointmentsRepository.find({
        where: { studio: { id: In(visibleStudioIds) } },
        order: { startsAt: 'DESC' },
      });
      const clientIds = new Set(
        appointments
          .map((appointment) => appointment.user?.id)
          .filter((userId): userId is string => Boolean(userId)),
      );
      users = users.filter((user) => {
        if (user.role === UserRole.SUPER_ADMIN) return false;
        if (user.role === UserRole.CLIENT) return clientIds.has(user.id);
        return (user.adminStudios ?? []).some((studio) => visibleStudioIds.includes(studio.id));
      });
    }

    const subscriptionByUserId = new Map<string, Subscription>();
    for (const subscription of activeSubscriptions) {
      const userId = subscription.user?.id;
      if (userId && !subscriptionByUserId.has(userId)) {
        subscriptionByUserId.set(userId, subscription);
      }
    }

    return users
      .filter((user) => {
        const status = user.isActive ? 'active' : 'blocked';
        const matchesStatus = !filters.status || filters.status === status;
        const haystack = `${user.fullName} ${user.email ?? ''} ${user.phone ?? ''}`.toLowerCase();
        return matchesStatus && (!search || haystack.includes(search));
      })
      .map((user) => this.toAdminUser(user, subscriptionByUserId.get(user.id)));
  }

  async getSuperAdminAppointments(
    filters: { date?: string; studioId?: string; masterId?: string; serviceId?: string; status?: AppointmentStatus },
    actor?: JwtUserPayload,
  ) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const scopedStudioIds = this.applyStudioFilter(visibleStudioIds, filters.studioId);
    const where: Record<string, unknown> = {};
    if (scopedStudioIds) where.studio = { id: In(scopedStudioIds) };
    if (filters.masterId) where.master = { id: filters.masterId };
    if (filters.serviceId) where.service = { id: filters.serviceId };
    if (filters.status) where.status = filters.status;

    if (filters.date) {
      const dayStart = parseMoscowDateTime(filters.date, '00:00');
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
      return this.appointmentsRepository.find({
        where: {
          ...where,
          startsAt: LessThan(dayEnd),
          endsAt: MoreThan(dayStart),
        },
        order: { startsAt: 'DESC' },
      });
    }

    return this.appointmentsRepository.find({ where, order: { startsAt: 'DESC' } });
  }

  async getSuperAdminAppointment(id: string, actor?: JwtUserPayload) {
    const appointment = await this.findAppointment(id);
    await this.ensureActorCanAccessStudios([appointment.studio.id], actor);
    return appointment;
  }

  async createAdminAppointment(dto: CreateAdminAppointmentDto, actor: JwtUserPayload) {
    const [user, service, master, studio] = await Promise.all([
      this.findUser(dto.clientId),
      this.findService(dto.serviceId),
      this.findMaster(dto.masterId),
      this.findStudio(dto.studioId),
    ]);
    const startsAt = resolveAppointmentStart(dto, new Date());
    const durationMinutes = dto.durationMinutes ?? service.durationMinutes;
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

    if (!user.isActive) {
      throw new BadRequestException('Blocked users cannot have new active appointments');
    }

    await this.ensureActorCanAccessStudios([studio.id], actor);
    await this.ensureActorCanAccessMaster(master, actor);
    await this.ensureMasterCanPerform(master, studio, service);
    await this.ensureAppointmentSlotAvailable(master.id, startsAt, endsAt);

    const saved = await this.appointmentsRepository.save(
      this.appointmentsRepository.create({
        user,
        service,
        master,
        studio,
        startsAt,
        endsAt,
        status: dto.status ?? AppointmentStatus.SCHEDULED,
        priceRub: dto.priceRub ?? service.priceRub,
        basePriceRub: service.priceRub,
        discountPercent: 0,
        paidBySubscriptionCredit: false,
        note: dto.note ?? undefined,
      }),
    );
    await this.audit(actor, 'CREATE_APPOINTMENT', 'appointment', saved.id, null, snapshotAppointment(saved));
    return saved;
  }

  async updateSuperAdminAppointment(id: string, dto: UpdateAdminAppointmentDto, actor: JwtUserPayload) {
    const appointment = await this.findAppointment(id);
    await this.ensureActorCanAccessStudios([appointment.studio.id], actor);
    const before = snapshotAppointment(appointment);
    const user = dto.clientId ? await this.findUser(dto.clientId) : appointment.user;
    const service = dto.serviceId ? await this.findService(dto.serviceId) : appointment.service;
    const master = dto.masterId ? await this.findMaster(dto.masterId) : appointment.master;
    const studio = dto.studioId ? await this.findStudio(dto.studioId) : appointment.studio;
    const startsAt = resolveAppointmentStart(dto, appointment.startsAt);
    const currentDurationMinutes = Math.max(5, Math.round((appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000));
    const durationMinutes = dto.durationMinutes ?? currentDurationMinutes ?? service.durationMinutes;
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

    if (!user.isActive) {
      throw new BadRequestException('Blocked users cannot have new active appointments');
    }

    await this.ensureActorCanAccessStudios([studio.id], actor);
    await this.ensureActorCanAccessMaster(master, actor);
    await this.ensureMasterCanPerform(master, studio, service);
    await this.ensureAppointmentSlotAvailable(master.id, startsAt, endsAt, id);

    appointment.user = user;
    appointment.service = service;
    appointment.master = master;
    appointment.studio = studio;
    appointment.startsAt = startsAt;
    appointment.endsAt = endsAt;
    appointment.status = dto.status ?? appointment.status;
    appointment.priceRub = dto.priceRub ?? appointment.priceRub;
    appointment.basePriceRub = service.priceRub;
    appointment.note = dto.note ?? appointment.note;

    const saved = await this.appointmentsRepository.save(appointment);
    await this.audit(actor, 'UPDATE_APPOINTMENT', 'appointment', saved.id, before, snapshotAppointment(saved));
    return saved;
  }

  async cancelSuperAdminAppointment(id: string, dto: CancelAdminAppointmentDto, actor: JwtUserPayload) {
    const appointment = await this.findAppointment(id);
    await this.ensureActorCanAccessStudios([appointment.studio.id], actor);
    const before = snapshotAppointment(appointment);
    appointment.status = AppointmentStatus.CANCELLED;
    appointment.note = dto.reason ? `${appointment.note ? `${appointment.note}\n` : ''}Cancel reason: ${dto.reason}` : appointment.note;
    const saved = await this.appointmentsRepository.save(appointment);
    await this.audit(actor, 'CANCEL_APPOINTMENT', 'appointment', saved.id, before, snapshotAppointment(saved));
    return saved;
  }

  async getClients(filters: { search?: string } = {}, actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    const users = await this.usersRepository.find({ where: { role: UserRole.CLIENT }, order: { createdAt: 'DESC' } });
    const search = filters.search?.trim().toLowerCase();

    if (!visibleStudioIds) {
      const subscriptions = await this.getActiveSubscriptionMap(users.map((user) => user.id));
      return users.filter((user) => this.userMatchesSearch(user, search)).map((user) => this.toAdminUser(user, subscriptions.get(user.id)));
    }

    const appointments = await this.appointmentsRepository.find({
      where: { studio: { id: In(visibleStudioIds) } },
      order: { startsAt: 'DESC' },
    });
    const userIds = new Set(appointments.map((appointment) => appointment.user.id));
    const filteredUsers = users.filter((user) => userIds.has(user.id) && this.userMatchesSearch(user, search));
    const subscriptions = await this.getActiveSubscriptionMap(filteredUsers.map((user) => user.id));
    return filteredUsers.map((user) => this.toAdminUser(user, subscriptions.get(user.id)));
  }

  async getRequests(filters: { status?: SupportTicketStatus; search?: string } = {}) {
    const tickets = await this.ticketsRepository.find({ order: { createdAt: 'DESC' } });
    const search = filters.search?.trim().toLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const haystack = `${ticket.subject} ${ticket.message} ${ticket.user.fullName} ${ticket.user.email ?? ''} ${ticket.user.phone ?? ''}`.toLowerCase();
      return matchesStatus && (!search || haystack.includes(search));
    });
  }

  async updateRequest(id: string, dto: { status?: SupportTicketStatus }, actor?: JwtUserPayload) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const before = snapshotTicket(ticket);
    if (dto.status) ticket.status = dto.status;
    const saved = await this.ticketsRepository.save(ticket);
    await this.audit(actor, 'UPDATE_SUPPORT_TICKET', 'support_ticket', saved.id, before, snapshotTicket(saved));
    return saved;
  }

  async updateSubscriptionStatus(id: string, status: SubscriptionStatus, actor?: JwtUserPayload) {
    const subscription = await this.subscriptionsRepository.findOne({ where: { id } });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const before = snapshotSubscription(subscription);
    subscription.status = status;
    if (status === SubscriptionStatus.FROZEN && !subscription.frozenUntil) {
      subscription.frozenUntil = addDays(new Date(), subscription.plan.freezeDays || 30);
    }
    if (status === SubscriptionStatus.CANCELLED) {
      subscription.autoRenewalEnabled = false;
    }
    const saved = await this.subscriptionsRepository.save(subscription);
    await this.audit(actor, 'UPDATE_SUBSCRIPTION_STATUS', 'subscription', saved.id, before, snapshotSubscription(saved));
    return saved;
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, actor?: JwtUserPayload) {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const before = snapshotPayment(payment);
    payment.status = status;
    const saved = await this.paymentsRepository.save(payment);
    await this.audit(actor, 'UPDATE_PAYMENT_STATUS', 'payment', saved.id, before, snapshotPayment(saved));
    return saved;
  }

  async assignUserRole(id: string, role: UserRole, actor: JwtUserPayload, studioIds: string[] = []) {
    if (id === actor.sub && role === UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot elevate yourself to super administrator');
    }

    const user = await this.findUser(id);
    const before = snapshotUser(user);
    if (user.role === UserRole.SUPER_ADMIN && role !== UserRole.SUPER_ADMIN) {
      const superAdmins = await this.usersRepository.count({ where: { role: UserRole.SUPER_ADMIN, isActive: true } });
      if (superAdmins <= 1) {
        throw new ForbiddenException('Cannot remove the last super administrator');
      }
    }

    user.role = role;
    user.adminStudios = role === UserRole.ADMIN && studioIds.length ? await this.findStudiosByIds(studioIds) : [];
    const saved = await this.usersRepository.save(user);
    await this.audit(actor, 'UPDATE_USER_ROLE', 'user', saved.id, before, snapshotUser(saved));
    return this.toAdminUser(saved);
  }

  async getNetworkSettings() {
    const setting = await this.settingsRepository.findOne({ where: { key: networkSettingsKey } });
    if (!setting || typeof setting.value !== 'object' || setting.value === null) {
      return defaultNetworkSettings;
    }
    return { ...defaultNetworkSettings, ...(setting.value as Record<string, unknown>) };
  }

  async updateNetworkSettings(dto: Record<string, unknown>, actor?: JwtUserPayload) {
    const before = await this.getNetworkSettings();
    const next = { ...before, ...dto };
    const setting = await this.settingsRepository.findOne({ where: { key: networkSettingsKey } });
    if (setting) {
      setting.value = next;
      await this.settingsRepository.save(setting);
    } else {
      await this.settingsRepository.save(this.settingsRepository.create({ key: networkSettingsKey, value: next }));
    }
    await this.audit(actor, 'UPDATE_NETWORK_SETTINGS', 'settings', networkSettingsKey, before, next);
    return next;
  }

  getAuditLog() {
    return this.auditLogService.findAll();
  }

  private async applyMasterDto(master: Master, dto: CreateMasterDto | UpdateMasterDto, isCreate: boolean) {
    if (dto.fullName !== undefined || dto.firstName !== undefined || dto.lastName !== undefined) {
      const name = normalizeMasterName(dto);
      master.firstName = name.firstName;
      master.lastName = name.lastName;
    } else if (isCreate) {
      throw new BadRequestException('Master full name is required');
    }

    if (dto.bio !== undefined || dto.description !== undefined) master.bio = dto.description ?? dto.bio ?? null;
    if (dto.phone !== undefined) master.phone = dto.phone.trim() || null;
    if (dto.specialization !== undefined) master.specialization = dto.specialization.trim() || null;
    if (dto.experienceYears !== undefined) master.experienceYears = dto.experienceYears;
    if (dto.photoUrl !== undefined) master.photoUrl = dto.photoUrl ? dto.photoUrl.trim() : null;
    if (dto.photoUrls !== undefined || dto.photoUrl !== undefined) {
      master.photoUrls = normalizePhotoUrls(dto.photoUrls ?? master.photoUrls, dto.photoUrl ? dto.photoUrl.trim() : master.photoUrl);
    }
    if (isCreate && master.isActive === undefined) master.isActive = true;

    if (dto.studioIds !== undefined || dto.studioId !== undefined) {
      const studioIds = dto.studioIds ?? (dto.studioId ? [dto.studioId] : []);
      if (studioIds.length === 0) {
        throw new BadRequestException('Master must be assigned to at least one studio');
      }
      master.studios = await this.findStudiosByIds(studioIds);
      master.studio = master.studios[0];
    } else if (isCreate) {
      throw new BadRequestException('Master must be assigned to at least one studio');
    }

    if (dto.serviceIds !== undefined) {
      master.services = dto.serviceIds.length > 0 ? await this.findServicesByIds(dto.serviceIds) : [];
    } else if (isCreate) {
      master.services = [];
    }
  }

  private async ensureShiftCanBeSaved(input: {
    master: Master;
    studio: Studio;
    startsAt: Date;
    endsAt: Date;
    isAvailable: boolean;
    excludeShiftId?: string;
  }) {
    if (input.endsAt <= input.startsAt) {
      throw new BadRequestException('Shift end time must be after start time');
    }

    if (!getMasterStudioIds(input.master).includes(input.studio.id)) {
      throw new BadRequestException('Master is not assigned to selected studio');
    }

    if (!input.isAvailable) {
      return;
    }

    const where = {
      master: { id: input.master.id },
      isAvailable: true,
      startsAt: LessThan(input.endsAt),
      endsAt: MoreThan(input.startsAt),
      ...(input.excludeShiftId ? { id: Not(input.excludeShiftId) } : {}),
    };
    const conflict = await this.shiftsRepository.findOne({ where });
    if (conflict) {
      throw new ConflictException('Shift intersects with another shift for this master');
    }
  }

  private async ensureShiftChangeKeepsAppointmentsInside(
    shiftId: string,
    masterId: string,
    startsAt: Date,
    endsAt: Date,
    isAvailable: boolean,
  ) {
    const oldShift = await this.shiftsRepository.findOneByOrFail({ id: shiftId });
    const appointments = await this.appointmentsRepository.find({
      where: {
        master: { id: oldShift.master.id },
        status: In(activeAppointmentStatuses),
        startsAt: LessThan(oldShift.endsAt),
        endsAt: MoreThan(oldShift.startsAt),
      },
    });

    const brokenAppointment = appointments.find(
      (appointment) =>
        !isAvailable ||
        appointment.master.id !== masterId ||
        appointment.startsAt < startsAt ||
        appointment.endsAt > endsAt,
    );

    if (brokenAppointment) {
      throw new ConflictException('Shift change affects existing appointments');
    }
  }

  private async ensureShiftHasNoActiveAppointments(shift: MasterShift) {
    const appointment = await this.appointmentsRepository.findOne({
      where: {
        master: { id: shift.master.id },
        status: In(activeAppointmentStatuses),
        startsAt: LessThan(shift.endsAt),
        endsAt: MoreThan(shift.startsAt),
      },
    });

    if (appointment) {
      throw new ConflictException('Cannot deactivate shift with active appointments');
    }
  }

  private async ensureMasterCanPerform(master: Master, studio: Studio, service: Service) {
    if (!getMasterStudioIds(master).includes(studio.id)) {
      throw new BadRequestException('Master is not assigned to selected studio');
    }
    if (master.services?.length && !master.services.some((masterService) => masterService.id === service.id)) {
      throw new BadRequestException('Master does not provide selected service');
    }
  }

  private async ensureAppointmentSlotAvailable(masterId: string, startsAt: Date, endsAt: Date, excludeAppointmentId?: string) {
    const shift = await this.shiftsRepository.findOne({
      where: {
        master: { id: masterId },
        isAvailable: true,
        startsAt: LessThan(startsAt),
        endsAt: MoreThan(endsAt),
      },
    });

    if (!shift && !(await this.shiftContainsSlot(masterId, startsAt, endsAt))) {
      throw new BadRequestException('Appointment must be inside an active master shift');
    }

    const conflict = await this.appointmentsRepository.findOne({
      where: {
        master: { id: masterId },
        status: In(activeAppointmentStatuses),
        startsAt: LessThan(endsAt),
        endsAt: MoreThan(startsAt),
        ...(excludeAppointmentId ? { id: Not(excludeAppointmentId) } : {}),
      },
    });

    if (conflict) {
      throw new ConflictException('Master already has an active appointment in this time slot');
    }
  }

  private async shiftContainsSlot(masterId: string, startsAt: Date, endsAt: Date) {
    const shifts = await this.shiftsRepository.find({
      where: { master: { id: masterId }, isAvailable: true },
    });
    if (shifts.length === 0) {
      return true;
    }
    return shifts.some((shift) => shift.startsAt <= startsAt && shift.endsAt >= endsAt);
  }

  private async ensureDateAvailabilityCanBeSaved(
    master: Master,
    input: {
      date: string;
      status: MasterDateAvailabilityStatus;
      studioId?: string | null;
      startTime?: string | null;
      endTime?: string | null;
    },
    excludeAvailabilityId?: string,
  ) {
    validateAvailabilityTime(input);

    if (input.studioId && !getMasterStudioIds(master).includes(input.studioId)) {
      throw new BadRequestException('Master is not assigned to selected studio');
    }

    const date = input.date.slice(0, 10);
    const existing = await this.dateAvailabilityRepository.find({
      where: {
        master: { id: master.id },
        date,
        ...(excludeAvailabilityId ? { id: Not(excludeAvailabilityId) } : {}),
      },
    });

    if (existing.length > 0) {
      throw new ConflictException('Master already has availability override for this date');
    }

    if ([MasterDateAvailabilityStatus.AVAILABLE, MasterDateAvailabilityStatus.CUSTOM].includes(input.status)) {
      const startsAt = parseMoscowDateTime(date, input.startTime ?? '00:00');
      const endsAt = parseMoscowDateTime(date, input.endTime ?? '00:00');
      const conflict = await this.appointmentsRepository.findOne({
        where: {
          master: { id: master.id },
          status: In(activeAppointmentStatuses),
          startsAt: LessThan(endsAt),
          endsAt: MoreThan(startsAt),
        },
      });
      if (conflict) {
        throw new ConflictException('Availability overlaps an existing appointment');
      }
    }
  }

  private async findScheduleChangeWarnings(masterId: string) {
    const futureAppointment = await this.appointmentsRepository.findOne({
      where: {
        master: { id: masterId },
        status: In(activeAppointmentStatuses),
        startsAt: MoreThan(new Date()),
      },
      order: { startsAt: 'ASC' },
    });

    return futureAppointment
      ? [
          {
            type: 'appointments_may_be_affected',
            appointmentId: futureAppointment.id,
            startsAt: futureAppointment.startsAt,
          },
        ]
      : [];
  }

  private async findMaster(id: string) {
    const master = await this.mastersRepository.findOne({ where: { id } });
    if (!master) throw new NotFoundException('Master not found');
    return master;
  }

  private async findStudio(id: string) {
    const studio = await this.studiosRepository.findOneBy({ id });
    if (!studio) throw new NotFoundException('Studio not found');
    return studio;
  }

  private async findService(id: string) {
    const service = await this.servicesRepository.findOneBy({ id });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  private async findUser(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async findAppointment(id: string) {
    const appointment = await this.appointmentsRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  private async findStudiosByIds(ids: string[]) {
    const studios = await this.studiosRepository.findBy({ id: In(ids) });
    if (studios.length !== new Set(ids).size) {
      throw new BadRequestException('One or more studios were not found');
    }
    return studios;
  }

  private async findServicesByIds(ids: string[]) {
    const services = await this.servicesRepository.findBy({ id: In(ids) });
    if (services.length !== new Set(ids).size) {
      throw new BadRequestException('One or more services were not found');
    }
    return services;
  }

  private async resolveVisibleStudioIds(actor?: JwtUserPayload) {
    if (!actor || actor.role === UserRole.SUPER_ADMIN) {
      return undefined;
    }

    const user = await this.usersRepository.findOne({ where: { id: actor.sub } });
    const assignedIds = user?.adminStudios?.map((studio) => studio.id).filter(Boolean) ?? [];
    if (assignedIds.length > 0) {
      return assignedIds;
    }

    const fallbackStudio = await this.studiosRepository.findOne({ where: { isActive: true }, order: { createdAt: 'ASC' } });
    return fallbackStudio ? [fallbackStudio.id] : [];
  }

  private applyStudioFilter(visibleStudioIds: string[] | undefined, requestedStudioId?: string) {
    if (!visibleStudioIds) {
      return requestedStudioId ? [requestedStudioId] : undefined;
    }

    if (!requestedStudioId) {
      return visibleStudioIds;
    }

    return visibleStudioIds.includes(requestedStudioId) ? [requestedStudioId] : [];
  }

  private async ensureActorCanAccessStudios(studioIds: string[], actor?: JwtUserPayload) {
    if (!studioIds.length) {
      return;
    }

    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    if (!visibleStudioIds) {
      return;
    }

    const forbiddenStudioId = studioIds.find((studioId) => !visibleStudioIds.includes(studioId));
    if (forbiddenStudioId) {
      throw new ForbiddenException('You can manage only your assigned studio');
    }
  }

  private async ensureActorCanAccessMaster(master: Master, actor?: JwtUserPayload) {
    const visibleStudioIds = await this.resolveVisibleStudioIds(actor);
    if (!visibleStudioIds) {
      return;
    }

    const masterStudioIds = getMasterStudioIds(master);
    if (!masterStudioIds.length || masterStudioIds.some((studioId) => visibleStudioIds.includes(studioId))) {
      return;
    }

    throw new ForbiddenException('You can manage only masters from your assigned studio');
  }

  private userMatchesSearch(user: User, search?: string) {
    if (!search) {
      return true;
    }
    return `${user.fullName} ${user.email ?? ''} ${user.phone ?? ''}`.toLowerCase().includes(search);
  }

  private async safeDashboardValue<T>(promise: Promise<T>, fallback: T) {
    try {
      return await promise;
    } catch {
      return fallback;
    }
  }

  private async findClientIdsForStudios(studioIds: string[]) {
    if (!studioIds.length) {
      return [];
    }

    const appointments = await this.appointmentsRepository.find({ where: { studio: { id: In(studioIds) } } });
    return [...new Set(appointments.map((appointment) => appointment.user.id))];
  }

  private async countScheduleConflicts(visibleStudioIds?: string[]) {
    const shifts = await this.shiftsRepository.find({
      where: { isAvailable: true, ...(visibleStudioIds ? { studio: { id: In(visibleStudioIds) } } : {}) },
      order: { startsAt: 'ASC' },
    });
    let conflicts = 0;
    for (let index = 0; index < shifts.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < shifts.length; nextIndex += 1) {
        const left = shifts[index];
        const right = shifts[nextIndex];
        if (left.master.id !== right.master.id) continue;
        if (right.startsAt >= left.endsAt) break;
        if (left.startsAt < right.endsAt && left.endsAt > right.startsAt) conflicts += 1;
      }
    }
    return conflicts;
  }

  private async getActiveSubscriptionMap(userIds: string[]) {
    if (!userIds.length) {
      return new Map<string, Subscription>();
    }
    const subscriptions = await this.subscriptionsRepository.find({
      where: {
        user: { id: In(userIds) },
        status: SubscriptionStatus.ACTIVE,
      },
      order: { endsAt: 'DESC' },
    });
    const map = new Map<string, Subscription>();
    for (const subscription of subscriptions) {
      const userId = subscription.user?.id;
      if (userId && !map.has(userId)) {
        map.set(userId, subscription);
      }
    }
    return map;
  }

  private toAdminUser(user: User, subscription?: Subscription) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email ?? null,
      phone: user.phone ?? null,
      role: user.role,
      status: user.isActive ? 'active' : 'blocked',
      isActive: user.isActive,
      adminStudios: user.adminStudios ?? [],
      hasActiveSubscription: Boolean(subscription),
      subscriptionStatus: subscription?.status ?? null,
      subscriptionPlanName: subscription?.plan?.name ?? null,
      subscriptionEndsAt: subscription?.endsAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private audit(
    actor: JwtUserPayload | undefined,
    action: string,
    entityType: string,
    entityId?: string | null,
    oldValue?: Record<string, unknown> | null,
    newValue?: Record<string, unknown> | null,
  ) {
    return this.auditLogService.record({
      actorId: actor?.sub ?? null,
      actorRole: actor?.role ?? UserRole.SUPER_ADMIN,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
    });
  }
}

function normalizeMasterName(dto: CreateMasterDto | UpdateMasterDto) {
  if (dto.fullName) {
    const parts = dto.fullName.trim().split(/\s+/);
    return { firstName: parts.shift() ?? '', lastName: parts.join(' ') || ' ' };
  }

  const firstName = dto.firstName?.trim() ?? '';
  const lastName = dto.lastName?.trim() ?? '';
  if (!firstName && !lastName) {
    throw new BadRequestException('Master full name is required');
  }
  return { firstName: firstName || lastName, lastName: lastName || ' ' };
}

function resolveShiftDates(dto: CreateMasterShiftDto | UpdateMasterShiftDto, fallback?: MasterShift) {
  const startsAt = dto.startsAt
    ? new Date(dto.startsAt)
    : dto.date && dto.startTime
      ? parseMoscowDateTime(dto.date, dto.startTime)
      : fallback?.startsAt;
  const endsAt = dto.endsAt
    ? new Date(dto.endsAt)
    : dto.date && dto.endTime
      ? parseMoscowDateTime(dto.date, dto.endTime)
      : fallback?.endsAt;

  if (!startsAt || !endsAt || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new BadRequestException('Valid shift date and time are required');
  }

  return { startsAt, endsAt };
}

function resolveAppointmentStart(dto: UpdateAdminAppointmentDto, fallback: Date) {
  const startsAt = dto.startsAt ? new Date(dto.startsAt) : dto.date && dto.startTime ? parseMoscowDateTime(dto.date, dto.startTime) : fallback;
  if (Number.isNaN(startsAt.getTime())) {
    throw new BadRequestException('Valid appointment start time is required');
  }
  return startsAt;
}

function parseMoscowDateTime(date: string, time: string) {
  return new Date(`${date.slice(0, 10)}T${time}:00.000+03:00`);
}

function startOfMoscowDay(value: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
  return parseMoscowDateTime(parts, '00:00');
}

function getMasterStudioIds(master: Master) {
  const ids = new Set<string>();
  master.studios?.forEach((studio) => ids.add(studio.id));
  if (master.studio?.id) ids.add(master.studio.id);
  return [...ids];
}

function normalizePhotoUrls(photoUrls?: string[], photoUrl?: string | null) {
  const urls = Array.from(
    new Set(
      (photoUrls ?? [])
        .map((url) => url.trim())
        .filter(Boolean),
    ),
  );
  const primary = photoUrl?.trim();
  if (primary) {
    return [primary, ...urls.filter((url) => url !== primary)];
  }
  return urls;
}

function snapshotMaster(master: Master) {
  return {
    id: master.id,
    fullName: `${master.firstName} ${master.lastName}`.trim(),
    phone: master.phone ?? null,
    description: master.bio ?? null,
    specialization: master.specialization ?? null,
    experienceYears: master.experienceYears ?? 0,
    photoUrl: master.photoUrl ?? null,
    photoUrls: master.photoUrls ?? [],
    isActive: master.isActive,
    studioIds: getMasterStudioIds(master),
    serviceIds: master.services?.map((service) => service.id) ?? [],
  };
}

function snapshotShift(shift: MasterShift) {
  return {
    id: shift.id,
    masterId: shift.master.id,
    studioId: shift.studio.id,
    startsAt: shift.startsAt,
    endsAt: shift.endsAt,
    isActive: shift.isAvailable,
  };
}

function snapshotAppointment(appointment: Appointment) {
  return {
    id: appointment.id,
    clientId: appointment.user.id,
    serviceId: appointment.service.id,
    masterId: appointment.master.id,
    studioId: appointment.studio.id,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    status: appointment.status,
    priceRub: appointment.priceRub,
  };
}

function snapshotUser(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email ?? null,
    phone: user.phone ?? null,
    role: user.role,
    status: user.isActive ? 'active' : 'blocked',
    adminStudioIds: user.adminStudios?.map((studio) => studio.id) ?? [],
  };
}

function snapshotTicket(ticket: SupportTicket) {
  return {
    id: ticket.id,
    userId: ticket.user.id,
    subject: ticket.subject,
    status: ticket.status,
  };
}

function snapshotSubscription(subscription: Subscription) {
  return {
    id: subscription.id,
    userId: subscription.user.id,
    planId: subscription.plan.id,
    status: subscription.status,
    startsAt: subscription.startsAt,
    endsAt: subscription.endsAt,
    frozenUntil: subscription.frozenUntil ?? null,
    autoRenewalEnabled: subscription.autoRenewalEnabled,
  };
}

function snapshotPayment(payment: Payment) {
  return {
    id: payment.id,
    userId: payment.user.id,
    amountRub: payment.amountRub,
    status: payment.status,
    provider: payment.provider,
    purpose: payment.purpose,
    relatedEntityId: payment.relatedEntityId ?? null,
  };
}

function snapshotService(service: Service) {
  return {
    id: service.id,
    title: service.title,
    slug: service.slug,
    categoryId: service.category?.id ?? null,
    shortDescription: service.shortDescription ?? null,
    description: service.description,
    durationMinutes: service.durationMinutes,
    priceRub: service.priceRub,
    subscriptionPriceRub: service.subscriptionPriceRub ?? null,
    superSubscriptionPriceRub: service.superSubscriptionPriceRub ?? null,
    imageUrl: service.imageUrl ?? null,
    galleryUrls: service.galleryUrls ?? [],
    isActive: service.isActive,
  };
}

function snapshotAvailability(availability: MasterDateAvailability) {
  return {
    id: availability.id,
    masterId: availability.master.id,
    studioId: availability.studio?.id ?? null,
    date: availability.date,
    status: availability.status,
    startTime: availability.startTime ?? null,
    endTime: availability.endTime ?? null,
    reason: availability.reason ?? null,
  };
}

function buildWeeklyScheduleResponse(rows: MasterWeeklySchedule[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const dayOfWeek = index + 1;
    const intervals = rows
      .filter((row) => row.dayOfWeek === dayOfWeek)
      .map((row) => ({
        id: row.id,
        studioId: row.studio.id,
        studio: row.studio,
        intervalIndex: row.intervalIndex,
        isWorking: row.isWorking,
        startTime: row.startTime,
        endTime: row.endTime,
        breakStartTime: row.breakStartTime,
        breakEndTime: row.breakEndTime,
      }));

    return {
      dayOfWeek,
      isWorking: intervals.length > 0,
      intervals,
    };
  });
}

function validateIntervals(intervals: WeeklyScheduleIntervalDto[]) {
  const normalized = intervals
    .filter((interval) => interval.isWorking !== false)
    .map((interval) => ({
      start: timeToMinutes(interval.startTime),
      end: timeToMinutes(interval.endTime),
      breakStart: interval.breakStartTime ? timeToMinutes(interval.breakStartTime) : null,
      breakEnd: interval.breakEndTime ? timeToMinutes(interval.breakEndTime) : null,
    }))
    .sort((left, right) => left.start - right.start);

  for (const interval of normalized) {
    if (interval.end <= interval.start) {
      throw new BadRequestException('Schedule interval end time must be after start time');
    }

    if ((interval.breakStart === null) !== (interval.breakEnd === null)) {
      throw new BadRequestException('Both break start and break end are required');
    }

    if (interval.breakStart !== null && interval.breakEnd !== null) {
      if (interval.breakEnd <= interval.breakStart || interval.breakStart < interval.start || interval.breakEnd > interval.end) {
        throw new BadRequestException('Break interval must be inside work interval');
      }
    }
  }

  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index].start < normalized[index - 1].end) {
      throw new ConflictException('Schedule intervals must not overlap');
    }
  }
}

function validateAvailabilityTime(input: { status: MasterDateAvailabilityStatus; startTime?: string | null; endTime?: string | null }) {
  if (![MasterDateAvailabilityStatus.AVAILABLE, MasterDateAvailabilityStatus.CUSTOM].includes(input.status)) {
    return;
  }

  if (!input.startTime || !input.endTime) {
    throw new BadRequestException('Available and custom availability require start and end time');
  }

  if (timeToMinutes(input.endTime) <= timeToMinutes(input.startTime)) {
    throw new BadRequestException('Availability end time must be after start time');
  }
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
