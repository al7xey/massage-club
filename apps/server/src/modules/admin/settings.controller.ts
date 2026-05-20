import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly adminService: AdminService) {}

  @Get('membership-entry-fee')
  getMembershipEntryFee() {
    return this.adminService.getMembershipEntryFee();
  }
}
