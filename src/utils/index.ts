import { AuthenticationError } from '@beautinique/backend-classes';
import type { TApiMethod } from '@beautinique/backend-types';
import { getUser } from '@beautinique/backend-utils';
import { HEADERS_MAP } from '@beautinique/shared-constants';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

import { COOKIES_DATA, SERVICE_SECRET_MAP } from '../constants/index.js';
import { envs } from '../envs/index.js';
import type {
  ICreateHeaders,
  IEndpoint,
  IJwtPayload,
  TGenerateRoutes,
  TParams,
  TRouteNode,
  TUser,
} from '../types/index.js';

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
export const getAuthUser = (payload?: IJwtPayload): TUser => {
  if (!payload?._id) {
    throw new AuthenticationError("User doesn't exist.");
  }

  const user = getUser(payload);

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

        const hasParams = fullPath.includes(':');

        result[key] = {
          method: value.method.toUpperCase() as TApiMethod,
          url: hasParams ? (params: TParams) => buildDynamicUrl(fullPath, params) : fullPath,
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
    ...(serviceSecret && { [HEADERS_MAP.serviceSecret]: SERVICE_SECRET_MAP[serviceSecret] }),

    ...(user && { [HEADERS_MAP.userId]: user._id, [HEADERS_MAP.userRole]: user.role }),

    ...(token && { [HEADERS_MAP.authorization]: token }),

    ...(loginRole && { [HEADERS_MAP.loginRole]: loginRole }),

    ...(contentType && { [HEADERS_MAP.contentType]: contentType }),
  };
};
