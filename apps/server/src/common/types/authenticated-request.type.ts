import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface JwtUserPayload {
  sub: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
