import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '../constants';
import { envs } from '../envs';
import type { IJwtPayload } from '../types';

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
  // Access Token
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

  // Refresh Token
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME);
};
