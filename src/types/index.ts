import type { TRole } from '@beautinique/be-constants';

export interface IJwtPayload {
  _id: string;
  role: TRole;
}

export type TUser = IJwtPayload;

export interface IUser {
  user: IJwtPayload;
}
