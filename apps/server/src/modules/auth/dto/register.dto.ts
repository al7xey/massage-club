import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserGender } from '@massage/shared';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Anna Ivanova' })
  @IsNotEmpty({ message: 'Введите имя и фамилию' })
  @IsString({ message: 'Введите имя и фамилию' })
  fullName: string;

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Введите корректный email' })
  email?: string;

  @ApiPropertyOptional({ example: '+79990000000' })
  @IsOptional()
  @IsString({ message: 'Введите корректный телефон' })
  phone?: string;

  @ApiProperty({ enum: UserGender, example: UserGender.FEMALE })
  @IsEnum(UserGender, { message: 'Выберите пол' })
  gender: UserGender;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Введите пароль' })
  @IsString({ message: 'Введите пароль' })
  @MinLength(8, { message: 'Пароль должен быть не короче 8 символов' })
  @MaxLength(128, { message: 'Пароль слишком длинный' })
  password: string;
}
