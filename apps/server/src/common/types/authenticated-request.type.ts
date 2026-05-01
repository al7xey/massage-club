import { Request } from 'express';
import { UserRole } from '../enums/user-role.enum';

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
}
