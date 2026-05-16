import type { TRole } from '@beautinique/be-constants';

export interface IJwtPayload {
  _id: string;
  role: TRole;
}
