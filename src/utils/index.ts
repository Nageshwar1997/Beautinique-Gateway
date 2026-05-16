import { AppError } from '@beautinique/be-classes';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { COOKIES_DATA } from '../constants';
import { envs } from '../envs';
import type { IJwtPayload } from '../types';

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
