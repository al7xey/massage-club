import { UserRole } from '../enums/user-role.enum';

export interface PublicUserDto {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends AuthTokensDto {
  user: PublicUserDto;
}
