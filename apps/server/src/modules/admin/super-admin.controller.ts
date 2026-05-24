import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { AppointmentStatus } from '../appointments/entities/appointment.entity';
import { CreateMasterDto } from '../masters/dto/create-master.dto';
import { UpdateMasterDto } from '../masters/dto/update-master.dto';
import { PaymentStatus } from '../payments/entities/payment.entity';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { UpdateServiceDto } from '../services/dto/update-service.dto';
import { CreateStudioDto } from '../studios/dto/create-studio.dto';
import { UpdateStudioDto } from '../studios/dto/update-studio.dto';
import { SupportTicketStatus } from '../support-tickets/entities/support-ticket.entity';
import { CreateSubscriptionPlanDto } from '../subscription-plans/dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from '../subscription-plans/dto/update-subscription-plan.dto';
import { SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import { AdminService } from './admin.service';
import { CancelAdminAppointmentDto } from './dto/cancel-admin-appointment.dto';
import { CreateAdminAppointmentDto } from './dto/create-admin-appointment.dto';
import { UpdatePhotoDto, UpdateServiceGalleryDto, UpdateServicePhotoDto } from './dto/update-photo.dto';
import { UpdateAdminAppointmentDto } from './dto/update-admin-appointment.dto';

@ApiTags('Super Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('masters')
  getMasters(@Query() query: { search?: string; studioId?: string }) {
    return this.adminService.getMasters(query);
  }

  @Post('masters')
  createMaster(@Body() dto: CreateMasterDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createMaster(dto, user);
  }

  @Get('masters/:id')
  getMaster(@Param('id') id: string) {
    return this.adminService.getMaster(id);
  }

  @Patch('masters/:id')
  updateMaster(@Param('id') id: string, @Body() dto: UpdateMasterDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMaster(id, dto, user);
  }

  @Patch('masters/:id/photo')
  updateMasterPhoto(@Param('id') id: string, @Body() dto: UpdatePhotoDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateMasterPhoto(id, dto.photoUrl, user);
  }

  @Delete('masters/:id')
  removeMaster(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeMaster(id, user);
  }

  @Get('services')
  getServices() {
    return this.adminService.getServices();
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createService(dto, user);
  }

  @Get('services/:id')
  getService(@Param('id') id: string) {
    return this.adminService.getService(id);
  }

  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateService(id, dto, user);
  }

  @Patch('services/:id/photo')
  updateServicePhoto(@Param('id') id: string, @Body() dto: UpdateServicePhotoDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateServicePhoto(id, dto.imageUrl, user);
  }

  @Patch('services/:id/gallery')
  updateServiceGallery(@Param('id') id: string, @Body() dto: UpdateServiceGalleryDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateServiceGallery(id, dto.galleryUrls, user);
  }

  @Delete('services/:id')
  removeService(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeService(id, user);
  }

  @Get('studios')
  getStudios() {
    return this.adminService.getStudios();
  }

  @Post('studios')
  createStudio(@Body() dto: CreateStudioDto) {
    return this.adminService.createStudio(dto);
  }

  @Patch('studios/:id')
  updateStudio(@Param('id') id: string, @Body() dto: UpdateStudioDto) {
    return this.adminService.updateStudio(id, dto);
  }

  @Get('schedule/overview')
  getScheduleOverview(@Query() query: { from?: string; to?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleOverview(query);
  }

  @Get('schedule/day')
  getScheduleDay(@Query() query: { date?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleDay(query);
  }

  @Get('schedule/week')
  getScheduleWeek(@Query() query: { startDate?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleWeek(query);
  }

  @Get('schedule/month')
  getScheduleMonth(@Query() query: { month?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleMonth(query);
  }

  @Get('users')
  getUsers(@Query() query: { search?: string; status?: string }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.getSuperAdminUsers(query, user);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.blockUser(id, user);
  }

  @Patch('users/:id/unblock')
  unblockUser(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.unblockUser(id, user);
  }

  @Patch('users/:id/role')
  assignUserRole(@Param('id') id: string, @Body() dto: { role: UserRole; studioIds?: string[] }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.assignUserRole(id, dto.role, user, dto.studioIds ?? []);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.deleteUser(id, user);
  }

  @Get('appointments')
  getAppointments(@Query() query: { date?: string; studioId?: string; masterId?: string; serviceId?: string; status?: AppointmentStatus }) {
    return this.adminService.getSuperAdminAppointments(query);
  }

  @Post('appointments')
  createAppointment(@Body() dto: CreateAdminAppointmentDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createAdminAppointment(dto, user);
  }

  @Get('appointments/:id')
  getAppointment(@Param('id') id: string) {
    return this.adminService.getSuperAdminAppointment(id);
  }

  @Get('clients')
  getClients(@Query() query: { search?: string }) {
    return this.adminService.getClients(query);
  }

  @Get('tariffs')
  getTariffs() {
    return this.adminService.getSubscriptionPlans();
  }

  @Post('tariffs')
  createTariff(@Body() dto: CreateSubscriptionPlanDto) {
    return this.adminService.createSubscriptionPlan(dto);
  }

  @Patch('tariffs/:id')
  updateTariff(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.adminService.updateSubscriptionPlan(id, dto);
  }

  @Delete('tariffs/:id')
  removeTariff(@Param('id') id: string) {
    return this.adminService.removeSubscriptionPlan(id);
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.adminService.getSubscriptions();
  }

  @Patch('subscriptions/:id/status')
  updateSubscriptionStatus(@Param('id') id: string, @Body() dto: { status: SubscriptionStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateSubscriptionStatus(id, dto.status, user);
  }

  @Get('payments')
  getPayments() {
    return this.adminService.getPayments();
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(@Param('id') id: string, @Body() dto: { status: PaymentStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updatePaymentStatus(id, dto.status, user);
  }

  @Get('certificates')
  getCertificates() {
    return this.adminService.getGiftCertificates();
  }

  @Get('requests')
  getRequests(@Query() query: { status?: SupportTicketStatus; search?: string }) {
    return this.adminService.getRequests(query);
  }

  @Patch('requests/:id')
  updateRequest(@Param('id') id: string, @Body() dto: { status?: SupportTicketStatus }, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateRequest(id, dto, user);
  }

  @Get('analytics')
  getAnalytics() {
    return this.adminService.getAnalyticsSummary();
  }

  @Get('settings')
  getNetworkSettings() {
    return this.adminService.getNetworkSettings();
  }

  @Patch('settings')
  updateNetworkSettings(@Body() dto: Record<string, unknown>, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateNetworkSettings(dto, user);
  }

  @Patch('appointments/:id')
  updateAppointment(@Param('id') id: string, @Body() dto: UpdateAdminAppointmentDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateSuperAdminAppointment(id, dto, user);
  }

  @Patch('appointments/:id/cancel')
  cancelAppointment(@Param('id') id: string, @Body() dto: CancelAdminAppointmentDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.cancelSuperAdminAppointment(id, dto, user);
  }

  @Get('audit-log')
  getAuditLog() {
    return this.adminService.getAuditLog();
  }
}
