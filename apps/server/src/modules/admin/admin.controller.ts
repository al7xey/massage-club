import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreateGiftCertificateDto } from '../gift-certificates/dto/create-gift-certificate.dto';
import { UpdateGiftCertificateDto } from '../gift-certificates/dto/update-gift-certificate.dto';
import { CreateMasterShiftDto } from '../masters/dto/create-master-shift.dto';
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
import { UpdateMembershipEntryFeeDto } from './dto/update-membership-entry-fee.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('appointments')
  getAppointments() {
    return this.adminService.getAppointments();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('analytics/summary')
  getAnalyticsSummary() {
    return this.adminService.getAnalyticsSummary();
  }

  @Patch('settings/membership-entry-fee')
  updateMembershipEntryFee(@Body() dto: UpdateMembershipEntryFeeDto) {
    return this.adminService.updateMembershipEntryFee(dto);
  }

  @Get('services')
  getServices() {
    return this.adminService.getServices();
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto) {
    return this.adminService.createService(dto);
  }

  @Patch('services/:id')
  updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.adminService.updateService(id, dto);
  }

  @Delete('services/:id')
  removeService(@Param('id') id: string) {
    return this.adminService.removeService(id);
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

  @Delete('studios/:id')
  removeStudio(@Param('id') id: string) {
    return this.adminService.removeStudio(id);
  }

  @Get('masters')
  getMasters() {
    return this.adminService.getMasters();
  }

  @Post('masters')
  createMaster(@Body() dto: CreateMasterDto) {
    return this.adminService.createMaster(dto);
  }

  @Patch('masters/:id')
  updateMaster(@Param('id') id: string, @Body() dto: UpdateMasterDto) {
    return this.adminService.updateMaster(id, dto);
  }

  @Delete('masters/:id')
  removeMaster(@Param('id') id: string) {
    return this.adminService.removeMaster(id);
  }

  @Get('master-shifts')
  getMasterShifts() {
    return this.adminService.getMasterShifts();
  }

  @Post('master-shifts')
  createMasterShift(@Body() dto: CreateMasterShiftDto) {
    return this.adminService.createMasterShift(dto);
  }

  @Patch('master-shifts/:id')
  updateMasterShift(@Param('id') id: string, @Body() dto: UpdateMasterShiftDto) {
    return this.adminService.updateMasterShift(id, dto);
  }

  @Delete('master-shifts/:id')
  removeMasterShift(@Param('id') id: string) {
    return this.adminService.removeMasterShift(id);
  }

  @Get('subscription-plans')
  getSubscriptionPlans() {
    return this.adminService.getSubscriptionPlans();
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.adminService.getSubscriptions();
  }

  @Post('subscription-plans')
  createSubscriptionPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.adminService.createSubscriptionPlan(dto);
  }

  @Patch('subscription-plans/:id')
  updateSubscriptionPlan(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    return this.adminService.updateSubscriptionPlan(id, dto);
  }

  @Delete('subscription-plans/:id')
  removeSubscriptionPlan(@Param('id') id: string) {
    return this.adminService.removeSubscriptionPlan(id);
  }

  @Get('gift-certificates')
  getGiftCertificates() {
    return this.adminService.getGiftCertificates();
  }

  @Get('payments')
  getPayments() {
    return this.adminService.getPayments();
  }

  @Post('gift-certificates')
  createGiftCertificate(@Body() dto: CreateGiftCertificateDto) {
    return this.adminService.createGiftCertificate(dto);
  }

  @Patch('gift-certificates/:id')
  updateGiftCertificate(@Param('id') id: string, @Body() dto: UpdateGiftCertificateDto) {
    return this.adminService.updateGiftCertificate(id, dto);
  }

  @Delete('gift-certificates/:id')
  removeGiftCertificate(@Param('id') id: string) {
    return this.adminService.removeGiftCertificate(id);
  }
}

