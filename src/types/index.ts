import type { TRole } from '@beautinique/be-constants';

export interface IJwtPayload {
  _id: string;
  role: TRole;
}

export type TUser = IJwtPayload;

export interface IUser {
  user: IJwtPayload;
}

export interface IRouteNode {
  base?: string;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

export interface IEndpoint {
  path: string;
  method: string;
}

export type TStrRecord = Record<string, string>;

interface IGeneratedEndpoint<T extends IEndpoint> {
  method: T['method'];
  path: T['path'];
  params: TStrRecord;
  getUrl: (params?: TStrRecord) => string;
}

export type TGenerateRoutes<T> = {
  [K in keyof T as K extends 'base' ? never : K]: T[K] extends IEndpoint
    ? IGeneratedEndpoint<T[K]>
    : T[K] extends object
      ? TGenerateRoutes<T[K]>
      : never;
};
