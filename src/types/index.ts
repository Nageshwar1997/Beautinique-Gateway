import type { TRole } from '@beautinique/be-constants';
import type { Request } from 'express';

export interface IJwtPayload {
  _id: string;
  role: TRole;
}

export interface AuthRequest extends Request {
  user: IJwtPayload;
}
