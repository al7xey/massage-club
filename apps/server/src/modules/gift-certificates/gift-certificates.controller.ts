import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { CreateGiftCertificateDto } from './dto/create-gift-certificate.dto';
import { GiftCertificatesService } from './gift-certificates.service';

@ApiTags('Gift certificates')
@Controller('gift-certificates')
export class GiftCertificatesController {
  constructor(private readonly giftCertificatesService: GiftCertificatesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtUserPayload, @Body() dto: CreateGiftCertificateDto) {
    return this.giftCertificatesService.create(user.sub, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMine(@CurrentUser() user: JwtUserPayload) {
    return this.giftCertificatesService.findMine(user.sub);
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.giftCertificatesService.findByCode(code);
  }
}
