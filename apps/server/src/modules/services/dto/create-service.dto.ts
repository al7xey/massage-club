import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(15)
  durationMinutes: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  durationLabel?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  composition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalSource?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty({ example: 4500 })
  @IsNumber()
  @Min(0)
  priceRub: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryUrls?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contraindications?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
