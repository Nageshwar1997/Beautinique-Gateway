import type { TService } from '@beautinique/be-constants';
import type { CookieOptions } from 'express';
import { envs } from '../envs';
import { createRouteHelper } from '../utils';

export const SERVICES_BASE_URLS: Record<TService, string> = {
  'mail-service': envs.url.service.mail,
  'media-service': envs.url.service.media,
  'product-service': envs.url.service.product,
  'user-service': envs.url.service.user,
} as const;

export const SERVICE_SECRET_MAP: Record<TService, string> = {
  'mail-service': envs.service_secret.mail,
  'media-service': envs.service_secret.media,
  'product-service': envs.service_secret.product,
  'user-service': envs.service_secret.user,
} as const;

export const ORIGINS = Object.values(envs.url.frontend);

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
    refreshAccessToken: { method: METHOD_MAP.POST, path: '/refresh-access-token' },
  },
  user_service: {
    default: '/user-service',
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
  media_service: { default: '/media-service' },
  product_service: {
    default: '/product-service',
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
    product: {
      base: '/product',
      draft: {
        base: '/draft',
        publish: { method: METHOD_MAP.PATCH, path: '/publish' }, // For publish existing draft
        save: { method: METHOD_MAP.POST, path: '/' }, // For upload new Product as draft
        get: { method: METHOD_MAP.GET, path: '/' }, // For get existing draft Product
        remove: { method: METHOD_MAP.DELETE, path: '/' }, // For remove existing draft
        update: { method: METHOD_MAP.PATCH, path: '/' }, // For already published product and seller again made some changes
      },
      publish: { method: METHOD_MAP.PATCH, path: '/publish' }, // For publish existing Product
      get: {
        dashboard: {
          base: '/dashboard',
          products: { method: METHOD_MAP.GET, path: '/products' },
          bySlug: { method: METHOD_MAP.GET, path: '/:slug' },
        },
        suggestions: { method: METHOD_MAP.GET, path: '/suggestions' },
        products: { method: METHOD_MAP.GET, path: '/products' },
        bySlug: { method: METHOD_MAP.GET, path: '/:slug' },
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
