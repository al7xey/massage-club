import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtUserPayload } from '../../common/types/authenticated-request.type';
import { UploadedFile as UploadedFileDto } from '../../common/types/uploaded-file.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UploadsService } from '../uploads/uploads.service';
import { UpsertSiteContentDto } from './dto/upsert-site-content.dto';
import { SiteContentService } from './site-content.service';

@Controller('site-content')
export class PublicSiteContentController {
  constructor(private readonly siteContentService: SiteContentService) {}

  @Get()
  findAll() {
    return this.siteContentService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.siteContentService.findByKey(key);
  }
}

@Controller('super-admin/site-content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminSiteContentController {
  constructor(
    private readonly siteContentService: SiteContentService,
    private readonly uploadsService: UploadsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  findAll() {
    return this.siteContentService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.siteContentService.findByKey(key);
  }

  @Patch(':key')
  async update(@Param('key') key: string, @Body() dto: UpsertSiteContentDto, @CurrentUser() user: JwtUserPayload) {
    const before = await this.siteContentService.findByKey(key).catch(() => null);
    const saved = await this.siteContentService.upsert(key, dto);
    await this.auditLogService.record({
      actorId: user.sub,
      actorRole: user.role,
      action: 'UPDATE_SITE_CONTENT',
      entityType: 'site_content',
      entityId: saved.id,
      oldValue: before ? { key: before.key, value: before.value, title: before.title, type: before.type } : null,
      newValue: { key: saved.key, value: saved.value, title: saved.title, type: saved.type },
    });
    return saved;
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: UploadedFileDto) {
    return this.uploadsService.saveUploadedFile(file, 'site-content');
  }
}
