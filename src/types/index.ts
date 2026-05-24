import type { TRole } from '@beautinique/be-constants';
import type { METHOD_MAP } from '../constants';
import { type SERVICES_BASE_URLS } from '../constants';

export interface IJwtPayload {
  _id: string;
  role: TRole;
}

export type TUser = IJwtPayload;

export interface IUser {
  user: IJwtPayload;
}

export type TApiMethod = (typeof METHOD_MAP)[keyof typeof METHOD_MAP];

export type TRouteNode = Record<string, unknown> & { base?: string };

export interface IEndpoint {
  path: string;
  method: TApiMethod;
}

export type TParams = Record<string, string | number>;

type TExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Record<Param | keyof TExtractRouteParams<`/${Rest}`>, string | number>
  : T extends `${string}:${infer Param}`
    ? Record<Param, string | number>
    : Record<string, never>;

interface IGeneratedEndpoint<T extends IEndpoint, FullPath extends string> {
  method: Uppercase<T['method']>;

  getUrl: (params?: TExtractRouteParams<FullPath>) => FullPath;
}

export type TGenerateRoutes<T, ParentPath extends string = ''> = {
  [K in keyof T as K extends 'base' ? never : K]: T[K] extends IEndpoint
    ? IGeneratedEndpoint<T[K], `${ParentPath}${T[K]['path']}`>
    : T[K] extends Record<string, unknown>
      ? TGenerateRoutes<
          T[K],
          `${ParentPath}${T[K] extends {
            base: infer B;
          }
            ? B extends string
              ? B
              : ''
            : ''}`
        >
      : never;
};

export interface ICreateHeaders {
  user?: Partial<TUser>;
  token?: string;
  loginRole?: string;
  contentType?: string;
  serviceSecret?: keyof typeof SERVICES_BASE_URLS;
}
