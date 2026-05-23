import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { CreateGiftCertificateDto } from '../gift-certificates/dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from '../gift-certificates/dto/update-gift-certificate.dto';
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
import { CreateSubscriptionPlanDto } from '../subscription-plans/dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from '../subscription-plans/dto/update-subscription-plan.dto';
import { AdminService } from './admin.service';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { UpdateMembershipEntryFeeDto } from './dto/update-membership-entry-fee.dto';
import { UpdateMasterServicesDto, UpdateMasterStudiosDto } from './dto/update-master-relations.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('analytics/summary')
  @Roles(UserRole.SUPER_ADMIN)
  getAnalyticsSummary() {
    return this.adminService.getAnalyticsSummary();
  }

  @Get('appointments')
  @Roles(UserRole.SUPER_ADMIN)
  getAppointments() {
    return this.adminService.getAppointments();
  }

  @Get('users')
  @Roles(UserRole.SUPER_ADMIN)
  getUsers() {
    return this.adminService.getUsers();
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
  @Roles(UserRole.SUPER_ADMIN)
  createService(@Body() dto: CreateServiceDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createService(dto, user);
  }

  @Patch('services/:id')
  @Roles(UserRole.SUPER_ADMIN)
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.updateService(id, dto, user);
  }

  @Delete('services/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeService(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.removeService(id, user);
  }

  @Get('studios')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getStudios() {
    return this.adminService.getStudios();
  }

  @Post('studios')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
  getMasters(@Query() query: { search?: string; studioId?: string; isActive?: string }) {
    return this.adminService.getMasters(query);
  }

  @Post('masters')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  createMaster(@Body() dto: CreateMasterDto, @CurrentUser() user: JwtUserPayload) {
    return this.adminService.createMaster(dto, user);
  }

  @Get('masters/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getMaster(@Param('id') id: string) {
    return this.adminService.getMaster(id);
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
  getScheduleOverview(@Query() query: { from?: string; to?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleOverview(query);
  }

  @Get('schedule/day')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleDay(@Query() query: { date?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleDay(query);
  }

  @Get('schedule/week')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleWeek(@Query() query: { startDate?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleWeek(query);
  }

  @Get('schedule/month')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getScheduleMonth(@Query() query: { month?: string; studioId?: string; masterId?: string; serviceId?: string }) {
    return this.adminService.getScheduleMonth(query);
  }

  @Get('schedules')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  getSchedules(@Query() query: { masterId?: string; studioId?: string; date?: string }) {
    return this.adminService.getMasterShifts(query);
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
  getMasterShifts(@Query() query: { masterId?: string; studioId?: string; date?: string }) {
    return this.adminService.getMasterShifts(query);
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

  @Get('subscriptions')
  @Roles(UserRole.SUPER_ADMIN)
  getSubscriptions() {
    return this.adminService.getSubscriptions();
  }

  @Post('subscription-plans')
  @Roles(UserRole.SUPER_ADMIN)
  createSubscriptionPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.adminService.createSubscriptionPlan(dto);
  }

  @Patch('subscription-plans/:id')
  @Roles(UserRole.SUPER_ADMIN)
  updateSubscriptionPlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.adminService.updateSubscriptionPlan(id, dto);
  }

  @Delete('subscription-plans/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeSubscriptionPlan(@Param('id') id: string) {
    return this.adminService.removeSubscriptionPlan(id);
  }

  @Get('gift-certificates')
  @Roles(UserRole.SUPER_ADMIN)
  getGiftCertificates() {
    return this.adminService.getGiftCertificates();
  }

  @Get('payments')
  @Roles(UserRole.SUPER_ADMIN)
  getPayments() {
    return this.adminService.getPayments();
  }

  @Post('gift-certificates')
  @Roles(UserRole.SUPER_ADMIN)
  createGiftCertificate(@Body() dto: CreateGiftCertificateDto) {
    return this.adminService.createGiftCertificate(dto);
  }

  @Patch('gift-certificates/:id')
  @Roles(UserRole.SUPER_ADMIN)
  updateGiftCertificate(@Param('id') id: string, @Body() dto: UpdateGiftCertificateDto) {
    return this.adminService.updateGiftCertificate(id, dto);
  }

  @Delete('gift-certificates/:id')
  @Roles(UserRole.SUPER_ADMIN)
  removeGiftCertificate(@Param('id') id: string) {
    return this.adminService.removeGiftCertificate(id);
  }
}
