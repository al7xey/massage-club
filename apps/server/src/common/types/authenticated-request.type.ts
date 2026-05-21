import { Request } from 'express';
import { UserGender } from '@massage/shared';
import { UserRole } from '../enums/user-role.enum';

export interface JwtUserPayload {
  sub: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  gender: UserGender;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
