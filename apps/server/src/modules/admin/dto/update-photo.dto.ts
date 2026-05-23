import { IsArray, IsString } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  photoUrl: string;
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
