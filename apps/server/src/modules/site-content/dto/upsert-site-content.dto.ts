import { Allow, IsEnum, IsOptional, IsString } from 'class-validator';
import { SiteContentType } from '../entities/site-content.entity';

export class UpsertSiteContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @Allow()
  value?: unknown;

  @IsOptional()
  @IsEnum(SiteContentType)
  type?: SiteContentType;
}
