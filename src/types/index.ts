import type { TApiMethod, TServiceName, TUserRole } from '@beautinique/backend-types';

export interface IJwtPayload {
  _id: string;
  role: TUserRole;
}

export type TUser = IJwtPayload;

export interface IUser {
  user: IJwtPayload;
}

export type TRouteNode = Record<string, unknown> & { base?: string };

export interface IEndpoint {
  path: string;
  method: Lowercase<TApiMethod>;
}

export type TParams = Record<string, string | number>;

type TExtractRouteParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Record<Param | keyof TExtractRouteParams<`/${Rest}`>, string | number>
  : T extends `${string}:${infer Param}`
    ? Record<Param, string | number>
    : never;

type TUrl<FullPath extends string> =
  TExtractRouteParams<FullPath> extends never
    ? FullPath
    : (params: TExtractRouteParams<FullPath>) => FullPath;

interface IGeneratedEndpoint<T extends IEndpoint, FullPath extends string> {
  method: Uppercase<T['method']>;

  url: TUrl<FullPath>;
}

export type TGenerateRoutes<
  T,
  ParentPath extends string = T extends { base: infer B } ? (B extends string ? B : '') : '',
> = {
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
  user?: TUser;
  token?: string;
  loginRole?: TUserRole;
  contentType?: string;
  serviceSecret?: TServiceName;
}

export interface TApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
  [key: string]: unknown;
}
