import { envs } from '@/envs';
import type { CookieOptions } from 'express';

export const CLIENT_OAUTH_REDIRECT_URL = `${envs.url.frontend.client}/auth/oauth`;

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: !envs.is_dev,
  sameSite: envs.is_dev ? 'lax' : 'none',
};

export const ACCESS_TOKEN_COOKIE_OPTIONS = { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 };

export const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
