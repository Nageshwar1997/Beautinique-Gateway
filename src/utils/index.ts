import { AppError } from '@beautinique/be-classes';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { COOKIES_DATA } from '../constants';
import { envs } from '../envs';
import type { IEndpoint, IJwtPayload, IRouteNode, TGenerateRoutes, TStrRecord } from '../types';

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

const extractParams = (path: string): TStrRecord => {
  const matches = path.match(/:([A-Za-z0-9_]+)/g);

  if (!matches) return {};

  return matches.reduce<TStrRecord>((acc, match) => {
    acc[match.replace(':', '')] = '';

    return acc;
  }, {});
};

const isEndpoint = (value: unknown): value is IEndpoint => {
  return typeof value === 'object' && value !== null && 'path' in value && 'method' in value;
};

const buildDynamicUrl = (path: string, params?: TStrRecord) => {
  if (!params) {
    return path;
  }

  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, String(value)),
    path,
  );
};

export const createGatewayHelper = <T extends Record<string, unknown>>(
  config: T,
): TGenerateRoutes<T> => {
  const build = <K extends IRouteNode>(node: K, parents: string[] = []): TGenerateRoutes<K> => {
    const currentBase = node.base ? [...parents, node.base] : parents;

    const result = {} as TGenerateRoutes<K>;

    Object.entries(node).forEach(([key, value]) => {
      if (key === 'base') return;

      if (isEndpoint(value)) {
        const fullPath = joinPaths(...currentBase, value.path);

        (result as Record<string, unknown>)[key] = {
          method: value.method,
          path: value.path,
          params: extractParams(fullPath),
          getUrl: (params?: TStrRecord) => buildDynamicUrl(fullPath, params),
        };

        return;
      }

      if (typeof value === 'object' && value !== null) {
        (result as Record<string, unknown>)[key] = build(value as IRouteNode, currentBase);
      }
    });

    return result;
  };

  return build(config);
};
