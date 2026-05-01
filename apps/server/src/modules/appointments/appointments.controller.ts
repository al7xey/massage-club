import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

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

  @Patch(':id/cancel')
  cancel(@CurrentUser() user: JwtUserPayload, @Param('id') id: string) {
    return this.appointmentsService.cancel(user.sub, id);
  }
}
