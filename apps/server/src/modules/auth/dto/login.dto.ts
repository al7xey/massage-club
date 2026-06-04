import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'client@example.com or +79990000000' })
  @IsNotEmpty({ message: 'Введите почту или телефон' })
  @IsString({ message: 'Введите почту или телефон' })
  identifier: string;

  @ApiProperty({ example: 'password123' })
  @IsNotEmpty({ message: 'Введите пароль' })
  @IsString({ message: 'Введите пароль' })
  @MaxLength(128, { message: 'Пароль слишком длинный' })
  password: string;
}
