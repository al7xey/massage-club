import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePhotoDto {
  @IsOptional()
  @IsString()
  photoUrl?: string | null;
}

export class UpdateServicePhotoDto {
  @IsString()
  imageUrl: string;
}

export class UpdateServiceGalleryDto {
  @IsArray()
  @IsString({ each: true })
  galleryUrls: string[];
}
