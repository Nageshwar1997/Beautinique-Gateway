import { envs } from '@/envs';
import type { IJwtPayload } from '@/types';
import type { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, envs.jwt.access_secret, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (payload: IJwtPayload) => {
  return jwt.sign(payload, envs.jwt.refresh_secret, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, envs.jwt.access_secret) as IJwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, envs.jwt.refresh_secret) as IJwtPayload;
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = !envs.is_dev;

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  };

  // Access Token
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/',
  });

  // Refresh Token
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/', // TODO: change this with actual path
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
