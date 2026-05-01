import type { Request } from 'express';

import type { TRole } from '@beautinique/be-constants';

export interface IJwtPayload {
  id: string;
  role: TRole;
}

export interface AuthRequest extends Request {
  user?: IJwtPayload;
}
