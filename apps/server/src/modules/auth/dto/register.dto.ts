import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '@massage/shared';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Anna Ivanova' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+79990000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserGender, example: UserGender.FEMALE })
  @IsEnum(UserGender)
  gender: UserGender;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
