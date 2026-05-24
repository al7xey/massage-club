import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { AppointmentStatus } from '../appointments/entities/appointment.entity';
import { CreateGiftCertificateDto } from '../gift-certificates/dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from '../gift-certificates/dto/update-gift-certificate.dto';
import { PaymentStatus } from '../payments/entities/payment.entity';
import { CreateMasterShiftDto } from '../masters/dto/create-master-shift.dto';
import { CreateMasterDateAvailabilityDto, UpdateMasterDateAvailabilityDto } from '../masters/dto/master-date-availability.dto';
import { PutWeeklyScheduleDto } from '../masters/dto/master-weekly-schedule.dto';
import { CreateMasterDto } from '../masters/dto/create-master.dto';
import { UpdateMasterShiftDto } from '../masters/dto/update-master-shift.dto';
import { UpdateMasterDto } from '../masters/dto/update-master.dto';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { UpdateServiceDto } from '../services/dto/update-service.dto';
import { CreateStudioDto } from '../studios/dto/create-studio.dto';
import { UpdateStudioDto } from '../studios/dto/update-studio.dto';
import { SupportTicketStatus } from '../support-tickets/entities/support-ticket.entity';
import { CreateSubscriptionPlanDto } from '../subscription-plans/dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from '../subscription-plans/dto/update-subscription-plan.dto';
import { SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { AdminService } from './admin.service';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdateMembershipEntryFeeDto } from './dto/update-membership-entry-fee.dto';
import { UpdateMasterServicesDto, UpdateMasterStudiosDto } from './dto/update-master-relations.dto';
import { CancelAdminAppointmentDto } from './dto/cancel-admin-appointment.dto';
import { CreateAdminAppointmentDto } from './dto/create-admin-appointment.dto';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getDashboard(@CurrentUser() user: JwtUserPayload) {
    return this.adminService.getDashboard(user);
  }

  @Get('analytics/summary')
  @Roles(UserRole.SUPER_ADMIN)
  getAnalyticsSummary() {
    return this.adminService.getAnalyticsSummary();
  }

  @Get('appointments')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAppointments(@Query() query: { date?: string; studioId?: string; masterId?: string; serviceId?: string; status?: AppointmentStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getSuperAdminAppointments(query, user);
  }

  @Get('appointments/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getAppointment(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getSuperAdminAppointment(id, user);
  }

  @Get('clients')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getClients(@Query() query: { search?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getClients(query, user);
  }

  @Get('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getUsers(@Query() query: { search?: string; status?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getSuperAdminUsers(query, user);
  }

  @Post('appointments')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createAppointment(@Body() dto: CreateAdminAppointmentDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createAdminAppointment(dto, user);
  }

  @Patch('appointments/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateAppointment(@Param('id') id: string, @Body() dto: UpdateAdminAppointmentDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateSuperAdminAppointment(id, dto, user);
  }

  @Patch('appointments/:id/cancel')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  cancelAppointment(@Param('id') id: string, @Body() dto: CancelAdminAppointmentDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.cancelSuperAdminAppointment(id, dto, user);
  }

  @Patch('settings/membership-entry-fee')
  @Roles(UserRole.SUPER_ADMIN)
  updateMembershipEntryFee(@Body() dto: UpdateMembershipEntryFeeDto) {
    return this.adminService.updateMembershipEntryFee(dto);
  }

  @Get('services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getServices() {
    return this.adminService.getServices();
  }

  @Post('services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createService(@Body() dto: CreateServiceDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createService(dto, user);
  }

  @Patch('services/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateService(id, dto, user);
  }

  @Delete('services/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  removeService(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeService(id, user);
  }

  @Get('studios')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getStudios(@CurrentUser() user: JwtUserPayload) {
    return this.adminService.getStudios(user);
  }

  @Post('studios')
  @Roles(UserRole.SUPER_ADMIN)
  createStudio(@Body() dto: CreateStudioDto) {
    return this.adminService.createStudio(dto);
  }

  @Patch('studios/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStudio(@Param('id') id: string, @Body() dto: UpdateStudioDto) {
    return this.adminService.updateStudio(id, dto);
  }

  @Delete('studios/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeStudio(@Param('id') id: string) {
    return this.adminService.removeStudio(id);
  }

  @Get('masters')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getMasters(@Query() query: { search?: string; studioId?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getMasters(query, user);
  }

  @Post('masters')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createMaster(@Body() dto: CreateMasterDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createMaster(dto, user);
  }

  @Get('masters/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getMaster(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    const master = await this.adminService.getMaster(id);
    if (user.role !== UserRole.SUPER_ADMIN) {
      const allowed = await this.adminService.getMasters({ studioId: master.studio?.id }, user);
      if (!allowed.some((item) => item.id === master.id)) {
        return null;
      }
    }
    return master;
  }

  @Patch('masters/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateMaster(@Param('id') id: string, @Body() dto: UpdateMasterDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMaster(id, dto, user);
  }

  @Patch('masters/:id/photo')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateMasterPhoto(@Param('id') id: string, @Body() dto: UpdatePhotoDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMasterPhoto(id, dto.photoUrl, user);
  }

  @Patch('masters/:id/studios')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateMasterStudios(@Param('id') id: string, @Body() dto: UpdateMasterStudiosDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMasterStudios(id, dto.studioIds, user);
  }

  @Patch('masters/:id/services')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateMasterServices(@Param('id') id: string, @Body() dto: UpdateMasterServicesDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMasterServices(id, dto.serviceIds, user);
  }

  @Delete('masters/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  removeMaster(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeMaster(id, user);
  }

  @Get('masters/:id/weekly-schedule')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getWeeklySchedule(@Param('id') id: string) {
    return this.adminService.getWeeklySchedule(id);
  }

  @Put('masters/:id/weekly-schedule')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateWeeklySchedule(@Param('id') id: string, @Body() dto: PutWeeklyScheduleDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateWeeklySchedule(id, dto, user);
  }

  @Get('masters/:id/date-availability')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getDateAvailability(@Param('id') id: string, @Query() query: { from?: string; to?: string }) {
    return this.adminService.getDateAvailability(id, query);
  }

  @Post('masters/:id/date-availability')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createDateAvailability(@Param('id') id: string, @Body() dto: CreateMasterDateAvailabilityDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createDateAvailability(id, dto, user);
  }

  @Patch('masters/:id/date-availability/:availabilityId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateDateAvailability(
    @Param('id') id: string,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateMasterDateAvailabilityDto,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.adminService.updateDateAvailability(id, availabilityId, dto, user);
  }

  @Delete('masters/:id/date-availability/:availabilityId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  removeDateAvailability(@Param('id') id: string, @Param('availabilityId') availabilityId: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeDateAvailability(id, availabilityId, user);
  }

  @Get('schedule/overview')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleOverview(@Query() query: { from?: string; to?: string; studioId?: string; masterId?: string; serviceId?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getScheduleOverview(query, user);
  }

  @Get('schedule/day')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleDay(@Query() query: { date?: string; studioId?: string; masterId?: string; serviceId?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getScheduleDay(query, user);
  }

  @Get('schedule/week')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleWeek(@Query() query: { startDate?: string; studioId?: string; masterId?: string; serviceId?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getScheduleWeek(query, user);
  }

  @Get('schedule/month')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleMonth(@Query() query: { month?: string; studioId?: string; masterId?: string; serviceId?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getScheduleMonth(query, user);
  }

  @Get('schedules')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSchedules(@Query() query: { masterId?: string; studioId?: string; date?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getMasterShifts(query, user);
  }

  @Post('schedules')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createSchedule(@Body() dto: CreateMasterShiftDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createMasterShift(dto, user);
  }

  @Patch('schedules/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateSchedule(@Param('id') id: string, @Body() dto: UpdateMasterShiftDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMasterShift(id, dto, user);
  }

  @Delete('schedules/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  removeSchedule(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeMasterShift(id, user);
  }

  @Get('master-shifts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getMasterShifts(@Query() query: { masterId?: string; studioId?: string; date?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getMasterShifts(query, user);
  }

  @Post('master-shifts')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createMasterShift(@Body() dto: CreateMasterShiftDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createMasterShift(dto, user);
  }

  @Patch('master-shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateMasterShift(@Param('id') id: string, @Body() dto: UpdateMasterShiftDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMasterShift(id, dto, user);
  }

  @Delete('master-shifts/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  removeMasterShift(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeMasterShift(id, user);
  }

  @Get('subscription-plans')
  @Roles(UserRole.SUPER_ADMIN)
  getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  @Get('tariffs')
  @Roles(UserRole.SUPER_ADMIN)
  getTariffs() {
    return this.adminService.getSubscriptionPlans();
  }

  @Get('subscriptions')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSubscriptions(@CurrentUser() user: JwtUserPayload) {
    return this.adminService.getSubscriptions(user);
  }

  @Patch('subscriptions/:id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updateSubscriptionStatus(@Param('id') id: string, @Body() dto: { status: SubscriptionStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateSubscriptionStatus(id, dto.status, user);
  }

  @Post('subscription-plans')
  @Roles(UserRole.SUPER_ADMIN)
  createSubscriptionPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.adminService.createSubscriptionPlan(dto);
  }

  @Post('tariffs')
  @Roles(UserRole.SUPER_ADMIN)
  createTariff(@Body() dto: CreateSubscriptionPlanDto) {
    return this.adminService.createSubscriptionPlan(dto);
  }

  @Patch('subscription-plans/:id')
  @Roles(UserRole.SUPER_ADMIN)
  updateSubscriptionPlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.adminService.updateSubscriptionPlan(id, dto);
  }

  @Patch('tariffs/:id')
  @Roles(UserRole.SUPER_ADMIN)
  updateTariff(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.adminService.updateSubscriptionPlan(id, dto);
  }

  @Delete('subscription-plans/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeSubscriptionPlan(@Param('id') id: string) {
    return this.adminService.removeSubscriptionPlan(id);
  }

  @Delete('tariffs/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeTariff(@Param('id') id: string) {
    return this.adminService.removeSubscriptionPlan(id);
  }

  @Get('gift-certificates')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getGiftCertificates(@CurrentUser() user: JwtUserPayload) {
    return this.adminService.getGiftCertificates(user);
  }

  @Get('certificates')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getCertificates(@CurrentUser() user: JwtUserPayload) {
    return this.adminService.getGiftCertificates(user);
  }

  @Get('payments')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getPayments(@CurrentUser() user: JwtUserPayload) {
    return this.adminService.getPayments(user);
  }

  @Patch('payments/:id/status')
  @Roles(UserRole.SUPER_ADMIN)
  updatePaymentStatus(@Param('id') id: string, @Body() dto: { status: PaymentStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updatePaymentStatus(id, dto.status, user);
  }

  @Post('gift-certificates')
  @Roles(UserRole.SUPER_ADMIN)
  createGiftCertificate(@Body() dto: CreateGiftCertificateDto) {
    return this.adminService.createGiftCertificate(dto);
  }

  @Post('certificates')
  @Roles(UserRole.SUPER_ADMIN)
  createCertificate(@Body() dto: CreateGiftCertificateDto) {
    return this.adminService.createGiftCertificate(dto);
  }

  @Patch('gift-certificates/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateGiftCertificate(@Param('id') id: string, @Body() dto: UpdateGiftCertificateDto) {
    return this.adminService.updateGiftCertificate(id, dto);
  }

  @Patch('certificates/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateCertificate(@Param('id') id: string, @Body() dto: UpdateGiftCertificateDto) {
    return this.adminService.updateGiftCertificate(id, dto);
  }

  @Delete('gift-certificates/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeGiftCertificate(@Param('id') id: string) {
    return this.adminService.removeGiftCertificate(id);
  }

  @Delete('certificates/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeCertificate(@Param('id') id: string) {
    return this.adminService.removeGiftCertificate(id);
  }

  @Get('requests')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getRequests(@Query() query: { status?: SupportTicketStatus; search?: string }) {
    return this.adminService.getRequests(query);
  }

  @Patch('requests/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateRequest(@Param('id') id: string, @Body() dto: { status?: SupportTicketStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateRequest(id, dto, user);
  }

  @Get('settings')
  @Roles(UserRole.SUPER_ADMIN)
  getNetworkSettings() {
    return this.adminService.getNetworkSettings();
  }

  @Patch('settings')
  @Roles(UserRole.SUPER_ADMIN)
  updateNetworkSettings(@Body() dto: Record<string, unknown>, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateNetworkSettings(dto, user);
  }
}
