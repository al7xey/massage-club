import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('Support tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateSupportTicketDto) {
    return this.supportTicketsService.create(user.sub, dto);
  }

  @Get('my')
  findMine(@CurrentUser() user: JwtUserPayload) {
    return this.supportTicketsService.findMine(user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findAll() {
    return this.supportTicketsService.findAll();
  }
}
