import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { AppointmentsService } from './appointments.service';
import { AppointmentSlotsQueryDto } from './dto/appointment-slots-query.dto';
import { AvailableMastersQueryDto } from './dto/available-masters-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ServiceSlotsQueryDto } from './dto/service-slots-query.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(user.sub, dto);
  }

  @Get('my')
  findMine(@CurrentUser() user: JwtUserPayload) {
    return this.appointmentsService.findMine(user.sub);
  }

  @Get('slots')
  findSlots(@Query() query: AppointmentSlotsQueryDto) {
    return this.appointmentsService.findSlots(query);
  }

  @Get('service-slots')
  findServiceSlots(@Query() query: ServiceSlotsQueryDto) {
    return this.appointmentsService.findServiceSlots(query);
  }

  @Get('available-masters')
  findAvailableMasters(@Query() query: AvailableMastersQueryDto) {
    return this.appointmentsService.findAvailableMasters(query);
  }

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.appointmentsService.cancel(user.sub, id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto) {
    return this.appointmentsService.updateStatus(id, dto.status);
  }
}
