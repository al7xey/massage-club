import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsService } from '../analytics/analytics.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { CreateGiftCertificateDto } from '../gift-certificates/dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from '../gift-certificates/dto/update-gift-certificate.dto';
import { GiftCertificatesService } from '../gift-certificates/gift-certificates.service';
import { CreateMasterShiftDto } from '../masters/dto/create-master-shift.dto';
import { CreateMasterDto } from '../masters/dto/create-master.dto';
import { UpdateMasterShiftDto } from '../masters/dto/update-master-shift.dto';
import { UpdateMasterDto } from '../masters/dto/update-master.dto';
import { MastersService } from '../masters/masters.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { UpdateServiceDto } from '../services/dto/update-service.dto';
import { ServicesService } from '../services/services.service';
import { CreateStudioDto } from '../studios/dto/create-studio.dto';
import { UpdateStudioDto } from '../studios/dto/update-studio.dto';
import { StudiosService } from '../studios/studios.service';
import { CreateSubscriptionPlanDto } from '../subscription-plans/dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from '../subscription-plans/dto/update-subscription-plan.dto';
import { SubscriptionPlansService } from '../subscription-plans/subscription-plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { UsersService } from '../users/users.service';
import { MembershipEntryFeeSettingDto, UpdateMembershipEntryFeeDto } from './dto/update-membership-entry-fee.dto';
import { SystemSetting } from './entities/system-setting.entity';

const membershipEntryFeeKey = 'membershipEntryFee';
const defaultMembershipEntryFee: MembershipEntryFeeSettingDto = {
  entryFeeRub: 1200,
  entryFeeEnabled: false,
};

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SystemSetting) private readonly settingsRepository: Repository<SystemSetting>,
    private readonly appointmentsService: AppointmentsService,
    private readonly usersService: UsersService,
    private readonly analyticsService: AnalyticsService,
    private readonly servicesService: ServicesService,
    private readonly studiosService: StudiosService,
    private readonly mastersService: MastersService,
    private readonly subscriptionPlansService: SubscriptionPlansService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly giftCertificatesService: GiftCertificatesService,
    private readonly paymentsService: PaymentsService,
  ) {}

  getAppointments() {
    return this.appointmentsService.findAll();
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
    return this.servicesService.findAll();
  }

  createService(dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  updateService(id: string, dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  removeService(id: string) {
    return this.servicesService.remove(id);
  }

  getStudios() {
    return this.studiosService.findAll();
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

  getMasters() {
    return this.mastersService.findAll();
  }

  createMaster(dto: CreateMasterDto) {
    return this.mastersService.create(dto);
  }

  updateMaster(id: string, dto: UpdateMasterDto) {
    return this.mastersService.update(id, dto);
  }

  removeMaster(id: string) {
    return this.mastersService.remove(id);
  }

  getMasterShifts() {
    return this.mastersService.findShifts();
  }

  createMasterShift(dto: CreateMasterShiftDto) {
    return this.mastersService.createShift(dto);
  }

  updateMasterShift(id: string, dto: UpdateMasterShiftDto) {
    return this.mastersService.updateShift(id, dto);
  }

  removeMasterShift(id: string) {
    return this.mastersService.removeShift(id);
  }

  getSubscriptionPlans() {
    return this.subscriptionPlansService.findAll();
  }

  getSubscriptions() {
    return this.subscriptionsService.findAll();
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

  getGiftCertificates() {
    return this.giftCertificatesService.findAll();
  }

  getPayments() {
    return this.paymentsService.findAll();
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
}
