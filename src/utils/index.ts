import { AppError } from '@beautinique/be-classes';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { COOKIES_DATA, HEADERS_KEYS, SERVICE_SECRET_MAP } from '../constants';
import { envs } from '../envs';
import type {
  ICreateHeaders,
  IEndpoint,
  IJwtPayload,
  TGenerateRoutes,
  TParams,
  TRouteNode,
} from '../types';

export const generateAccessToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, envs.jwt.access_secret, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, envs.jwt.refresh_secret, { expiresIn: '7d' });
};

export const generateAuthTokens = (payload: IJwtPayload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, envs.jwt.access_secret) as IJwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, envs.jwt.refresh_secret) as IJwtPayload;
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  // Access Token
  res.cookie(COOKIES_DATA.access_token.name, accessToken, COOKIES_DATA.access_token.options);

  // Refresh Token
  res.cookie(COOKIES_DATA.refresh_token.name, refreshToken, COOKIES_DATA.refresh_token.options);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(COOKIES_DATA.access_token.name);
  res.clearCookie(COOKIES_DATA.refresh_token.name);
};

/* ========== GET AUTH USER ========== */
export const getUser = (req: Request) => {
  const user = req.user;

  if (!user) throw new AppError({ message: 'You are not logged in', code: 'AUTHENTICATION_ERROR' });

  return user;
};

const joinPaths = (...paths: (string | undefined)[]) =>
  paths.filter(Boolean).join('/').replace(/\/+/g, '/').replace(/\/$/, '');

const isEndpoint = (value: unknown): value is IEndpoint => {
  return typeof value === 'object' && value !== null && 'path' in value && 'method' in value;
};

const buildDynamicUrl = <TPath extends string>(path: TPath, params?: TParams): TPath => {
  if (!params) {
    return path;
  }

  let result = path as string;

  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });

  return result as TPath;
};

export const createRouteHelper = <T extends Record<string, unknown>>(
  config: T,
): TGenerateRoutes<T> => {
  const build = (node: TRouteNode, parents: string[] = []): Record<string, unknown> => {
    const currentBase = node.base ? [...parents, node.base] : parents;

    const result: Record<string, unknown> = {};

    Object.entries(node).forEach(([key, value]) => {
      if (isEndpoint(value)) {
        const fullPath = joinPaths(...currentBase, value.path);

        result[key] = {
          method: value.method.toUpperCase() as Uppercase<typeof value.method>,

          getUrl: (params?: TParams) => buildDynamicUrl(fullPath, params),
        };

        return;
      }

      if (typeof value === 'object' && value !== null) {
        result[key] = build(value as TRouteNode, currentBase);
      }
    });

    return result;
  };

  return build(config) as TGenerateRoutes<T>;
};

export const createHeaders = ({
  user,
  token,
  loginRole,
  contentType,
  serviceSecret,
}: ICreateHeaders = {}) => {
  return {
    ...(serviceSecret && { [HEADERS_KEYS.serviceSecret]: SERVICE_SECRET_MAP[serviceSecret] }),

    ...(user && { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role }),

    ...(token && { [HEADERS_KEYS.authorization]: token }),

    ...(loginRole && { [HEADERS_KEYS.loginRole]: loginRole }),

    ...(contentType && { [HEADERS_KEYS.contentType]: contentType }),
  };
};
