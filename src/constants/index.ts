import type { TService } from '@beautinique/be-constants';
import type { CookieOptions } from 'express';
import { envs } from '../envs';
import { createRouteHelper } from '../utils';

export const SERVICES_BASE_URLS: Record<TService, string> = {
  'mail-service': `${envs.url.service.mail}/api/v1`,
  'media-service': `${envs.url.service.media}/api/v1`,
  'product-service': `${envs.url.service.product}/api/v1`,
  'user-service': `${envs.url.service.user}/api/v1`,
} as const;

export const SERVICE_SECRET_MAP: Record<TService, string> = {
  'mail-service': envs.service_secret.mail,
  'media-service': envs.service_secret.media,
  'product-service': envs.service_secret.product,
  'user-service': envs.service_secret.user,
} as const;

export const ORIGINS = Object.values(envs.url.frontend);

export const METHODS = ['get', 'post', 'put', 'patch', 'delete'] as const;

export const METHOD_MAP = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
} as const;

export const METHODS_AND_PATHS = {
  base: '/api/v1',
  gateway: {
    home: { method: METHOD_MAP.GET, path: '/' },
    health: { method: METHOD_MAP.GET, path: '/health' },
    wakeUp: { method: METHOD_MAP.GET, path: '/wake-up' },
    refreshAccessToken: { method: METHOD_MAP.POST, path: '/refresh-access-token' },
  },
  user_service: {
    base: '/user-service',
    auth: {
      base: '/auth',
      login: {
        base: '/login',
        manual: { method: METHOD_MAP.POST, path: '/manual' },
        oauth: {
          google: {
            redirect: { method: METHOD_MAP.GET, path: '/oauth/google/redirect' },
            callback: { method: METHOD_MAP.GET, path: '/oauth/google/callback' },
          },

          linkedin: {
            redirect: { method: METHOD_MAP.GET, path: '/oauth/linkedin/redirect' },
            callback: { method: METHOD_MAP.GET, path: '/oauth/linkedin/callback' },
          },

          github: {
            redirect: { method: METHOD_MAP.GET, path: '/oauth/github/redirect' },
            callback: { method: METHOD_MAP.GET, path: '/oauth/github/callback' },
          },
        },
      },
      logout: { method: METHOD_MAP.DELETE, path: '/logout' },
      register: {
        base: '/register',
        sendOtp: { method: METHOD_MAP.POST, path: '/send-otp' },
        resendOtp: { method: METHOD_MAP.PATCH, path: '/resend-otp' },
        verifyOtp: { method: METHOD_MAP.POST, path: '/verify-otp' },
        saveUser: { method: METHOD_MAP.POST, path: '/save-user' },
      },
      password: {
        base: '/password',
        forgot: {
          sendOtp: { method: METHOD_MAP.POST, path: '/forgot-send-otp' },
          resendOtp: { method: METHOD_MAP.PATCH, path: '/forgot-resend-otp' },
          verifyOtp: { method: METHOD_MAP.POST, path: '/forgot-verify-otp' },
          save: { method: METHOD_MAP.POST, path: '/forgot-save' },
        },
        change: { method: METHOD_MAP.PATCH, path: '/change' },
        set: { method: METHOD_MAP.PATCH, path: '/set' },
      },
    },
    user: {
      base: '/user',
      session: { method: METHOD_MAP.GET, path: '/session' },
    },
  },
  media_service: { base: '/media-service' },
  product_service: {
    base: '/product-service',
    category: {
      base: '/category',
      add: { method: METHOD_MAP.POST, path: '/' },
      update: { method: METHOD_MAP.PATCH, path: '/:categoryId' },
      delete: { method: METHOD_MAP.DELETE, path: '/:categoryId' },
      get: {
        byParentLevel: { method: METHOD_MAP.GET, path: '/by-parent-level' },
        byHierarchy: { method: METHOD_MAP.GET, path: '/by-hierarchy' },
      },
    },
  },
} as const;

export const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: !envs.is_dev,
  sameSite: envs.is_dev ? 'lax' : 'none',
};

export const COOKIES_DATA = {
  access_token: {
    name: 'access_token',
    options: { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 } as CookieOptions,
  },
  refresh_token: {
    name: 'refresh_token',
    options: { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 } as CookieOptions,
  },
} as const;

export const HEADERS_KEYS = {
  serviceSecret: 'X-Service-Secret',
  userId: 'X-User-Id',
  userRole: 'X-User-Role',
  authorization: 'Authorization',
  contentType: 'Content-Type',
  loginRole: 'X-Login-Role',
} as const;

export const API_METHODS_AND_URLS = createRouteHelper(METHODS_AND_PATHS);
