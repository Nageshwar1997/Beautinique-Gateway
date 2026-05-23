import type { TService } from '@beautinique/be-constants';
import type { CookieOptions } from 'express';
import { envs } from '../envs';
import { createGatewayHelper } from '../utils';

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

export const API_ROUTES_AND_METHODS = {
  user: {
    login: {
      manual: { method: 'POST', url: '/auth/login/manual' },
      oAuth: {
        google: {
          redirect: { method: 'GET', url: '/auth/login/oauth/google/redirect' },
          callback: { method: 'GET', url: '/auth/login/oauth/google/callback' },
        },
        github: {
          redirect: { method: 'GET', url: '/auth/login/oauth/github/redirect' },
          callback: { method: 'GET', url: '/auth/login/oauth/github/callback' },
        },
        linkedin: {
          redirect: { method: 'GET', url: '/auth/login/oauth/linkedin/redirect' },
          callback: { method: 'GET', url: '/auth/login/oauth/linkedin/callback' },
        },
      },
    },
    logout: { method: 'DELETE', url: '/auth/logout' },
    password: {
      forgot: {
        sendOtp: { method: 'POST', url: '/auth/password/forgot-send-otp' },
        resendOtp: { method: 'PATCH', url: '/auth/password/forgot-resend-otp' },
        verifyOtp: { method: 'POST', url: '/auth/password/forgot-verify-otp' },
        save: { method: 'POST', url: '/auth/password/forgot-save' },
      },
      change: { method: 'PATCH', url: '/auth/password/change' },
      set: { method: 'PATCH', url: '/auth/password/set' },
    },
    register: {
      sendOtp: { method: 'POST', url: '/auth/register/send-otp' },
      resendOtp: { method: 'PATCH', url: '/auth/register/resend-otp' },
      verifyOtp: { method: 'POST', url: '/auth/register/verify-otp' },
      saveUser: { method: 'POST', url: '/auth/register/save-user' },
    },
    session: { method: 'GET', url: '/user/session' },
  },
  product: {
    category: {
      add: { method: 'POST', url: '/category/add' },
      update: { method: 'PATCH', url: '/category/update' },
      delete: { method: 'DELETE', url: '/category/delete' },
      get: {
        byParentLevel: { method: 'GET', url: '/category/by-parent-level' },
        byHierarchy: { method: 'GET', url: '/category/by-hierarchy' },
      },
    },
  },
};

export const METHODS_AND_PATHS = {
  base: '/api/v1',
  gateway: {
    home: { path: '/', method: 'get' },
    health: { path: '/health', method: 'get' },
    wakeUp: { path: '/wake-up', method: 'get' },
    refreshAccessToken: { path: '/refresh-access-token', method: 'post' },
  },
  user_service: {
    base: '/user-service',
    auth: {
      base: '/auth',
      login: {
        base: '/login',
        manual: { path: '/manual', method: 'post' },
        oauth: {
          google: {
            redirect: { path: '/oauth/google/redirect', method: 'get' },
            callback: { path: '/oauth/google/callback', method: 'get' },
          },

          linkedin: {
            redirect: { path: '/oauth/linkedin/redirect', method: 'get' },
            callback: { path: '/oauth/linkedin/callback', method: 'get' },
          },

          github: {
            redirect: { path: '/oauth/github/redirect', method: 'get' },
            callback: { path: '/oauth/github/callback', method: 'get' },
          },
        },
      },
      logout: { path: '/logout', method: 'delete' },
      register: {
        base: '/register',
        sendOtp: { path: '/send-otp', method: 'post' },
        resendOtp: { path: '/resend-otp', method: 'patch' },
        verifyOtp: { path: '/verify-otp', method: 'post' },
        saveUser: { path: '/save-user', method: 'post' },
      },
      password: {
        base: '/password',
        forgot: {
          sendOtp: { path: '/forgot-send-otp', method: 'post' },
          resendOtp: { path: '/forgot-resend-otp', method: 'patch' },
          verifyOtp: { path: '/forgot-verify-otp', method: 'post' },
          save: { path: '/forgot-save', method: 'post' },
        },
        change: { path: '/change', method: 'patch' },
        set: { path: '/set', method: 'patch' },
      },
    },
    user: {
      base: '/user',
      session: { method: 'get', path: '/session' },
    },
  },
  media_service: { base: '/media-service' },
  product_service: {
    base: '/product-service',
    category: {
      base: '/category',
      add: { method: 'post', path: '/' },
      update: { method: 'patch', path: '/:categoryId' },
      delete: { method: 'delete', path: '/:categoryId' },
      get: {
        byParentLevel: { method: 'get', path: '/by-parent-level' },
        byHierarchy: { method: 'get', path: '/by-hierarchy' },
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

export const ROUTES = createGatewayHelper(METHODS_AND_PATHS);
