import type { TServiceName } from '@beautinique/backend-types';
import { API_METHODS_MAP, SERVICE_NAMES_MAP } from '@beautinique/shared-constants';
import type { CookieOptions } from 'express';

import { envs } from '../envs/index.js';
import { createRouteHelper } from '../utils/index.js';

export const SERVICES_BASE_URLS: Record<TServiceName, string> = {
  [SERVICE_NAMES_MAP['mail-service']]: envs.url.service.mail,
  [SERVICE_NAMES_MAP['media-service']]: envs.url.service.media,
  [SERVICE_NAMES_MAP['product-service']]: envs.url.service.product,
  [SERVICE_NAMES_MAP['user-service']]: envs.url.service.user,
} as const;

export const SERVICE_SECRET_MAP: Record<TServiceName, string> = {
  [SERVICE_NAMES_MAP['mail-service']]: envs.service_secret.mail,
  [SERVICE_NAMES_MAP['media-service']]: envs.service_secret.media,
  [SERVICE_NAMES_MAP['product-service']]: envs.service_secret.product,
  [SERVICE_NAMES_MAP['user-service']]: envs.service_secret.user,
} as const;

export const ORIGINS = Object.values(envs.url.frontend);

const { DELETE, GET, PATCH, POST } = API_METHODS_MAP;

export const METHODS_AND_PATHS = {
  base: '/api/v1',
  home: { method: GET, path: '/' },
  health: { method: GET, path: '/health' },
  overall_health: { method: GET, path: '/overall-health' },
  wakeUp: { method: GET, path: '/wake-up' },
  gateway: {
    refreshAccessToken: { method: POST, path: '/refresh-access-token' },
  },
  user_service: {
    default: '/user-service',
    auth: {
      base: '/auth',
      login: {
        base: '/login',
        manual: { method: POST, path: '/manual' },
        oauth: {
          google: {
            redirect: { method: GET, path: '/oauth/google/redirect' },
            callback: { method: GET, path: '/oauth/google/callback' },
          },

          linkedin: {
            redirect: { method: GET, path: '/oauth/linkedin/redirect' },
            callback: { method: GET, path: '/oauth/linkedin/callback' },
          },

          github: {
            redirect: { method: GET, path: '/oauth/github/redirect' },
            callback: { method: GET, path: '/oauth/github/callback' },
          },
        },
      },
      logout: { method: DELETE, path: '/logout' },
      register: {
        base: '/register',
        sendOtp: { method: POST, path: '/send-otp' },
        resendOtp: { method: PATCH, path: '/resend-otp' },
        verifyOtp: { method: POST, path: '/verify-otp' },
        saveUser: { method: POST, path: '/save-user' },
      },
      password: {
        base: '/password',
        forgot: {
          sendOtp: { method: POST, path: '/forgot-send-otp' },
          resendOtp: { method: PATCH, path: '/forgot-resend-otp' },
          verifyOtp: { method: POST, path: '/forgot-verify-otp' },
          save: { method: POST, path: '/forgot-save' },
        },
        change: { method: PATCH, path: '/change' },
        set: { method: PATCH, path: '/set' },
      },
    },
    user: {
      base: '/user',
      session: { method: GET, path: '/session' },
    },
  },
  media_service: { default: '/media-service' },
  product_service: {
    default: '/product-service',
    category: {
      base: '/category',
      add: { method: POST, path: '/' },
      update: { method: PATCH, path: '/:categoryId' },
      delete: { method: DELETE, path: '/:categoryId' },
      get: {
        byParentLevel: { method: GET, path: '/by-parent-level' },
        byHierarchy: { method: GET, path: '/by-hierarchy' },
      },
    },
    product: {
      base: '/product',
      draft: {
        base: '/draft',
        publish: { method: PATCH, path: '/publish' }, // For publish existing draft
        save: { method: POST, path: '/' }, // For upload new Product as draft
        get: { method: GET, path: '/' }, // For get existing draft Product
        remove: { method: DELETE, path: '/' }, // For remove existing draft
        update: { method: PATCH, path: '/' }, // For already published product and seller again made some changes
      },
      publish: { method: PATCH, path: '/publish' }, // For publish existing Product
      get: {
        dashboard: {
          base: '/dashboard',
          products: { method: GET, path: '/products' },
          bySlug: { method: GET, path: '/:slug' },
        },
        suggestions: { method: GET, path: '/suggestions' },
        products: { method: GET, path: '/products' },
        bySlug: { method: GET, path: '/:slug' },
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

export const API_METHODS_AND_URLS = createRouteHelper(METHODS_AND_PATHS);

export const LOGGER_BASE_OPTIONS = {
  level: envs.is_dev ? 'debug' : 'info',
  pretty: envs.is_dev,
} as const;
