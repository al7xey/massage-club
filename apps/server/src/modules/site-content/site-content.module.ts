import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UploadsModule } from '../uploads/uploads.module';
import { SiteContent } from './entities/site-content.entity';
import { PublicSiteContentController, SuperAdminSiteContentController } from './site-content.controller';
import { SiteContentService } from './site-content.service';

@Module({
  imports: [TypeOrmModule.forFeature([SiteContent]), AuditLogModule, UploadsModule],
  controllers: [PublicSiteContentController, SuperAdminSiteContentController],
  providers: [SiteContentService],
  exports: [SiteContentService, TypeOrmModule],
})
export class SiteContentModule {}
