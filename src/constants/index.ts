import { API_METHODS_MAP, SERVICE_NAMES_MAP } from '@beautinique/backend-constants';
import type { TServiceName } from '@beautinique/backend-types';
import type { CookieOptions } from 'express';

import { envs } from '../envs/index.js';
import { createRouteHelper } from '../utils/index.js';

export const SERVICES_BASE_URLS: Record<TServiceName, string> = {
  [SERVICE_NAMES_MAP.mail]: envs.url.service.mail,
  [SERVICE_NAMES_MAP.media]: envs.url.service.media,
  [SERVICE_NAMES_MAP.product]: envs.url.service.product,
  [SERVICE_NAMES_MAP.user]: envs.url.service.user,
  [SERVICE_NAMES_MAP.organization]: envs.url.service.organization,
} as const;

export const SERVICE_SECRET_MAP: Record<TServiceName, string> = {
  [SERVICE_NAMES_MAP.mail]: envs.service_secret.mail,
  [SERVICE_NAMES_MAP.media]: envs.service_secret.media,
  [SERVICE_NAMES_MAP.product]: envs.service_secret.product,
  [SERVICE_NAMES_MAP.user]: envs.service_secret.user,
  [SERVICE_NAMES_MAP.organization]: envs.service_secret.organization,
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
    default: `/${SERVICE_NAMES_MAP.user}`,
    health: { method: GET, path: '/health' },
    wakeUp: { method: GET, path: '/wake-up' },
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
      },
    },
    user: {
      base: '/user',
      session: { method: GET, path: '/session' },
      update: { method: PATCH, path: '/' },
      password: {
        base: '/password',
        change: { method: PATCH, path: '/change' },
        set: { method: PATCH, path: '/set' },
      },
    },
    admin: {
      base: '/admin',
      territory: {
        base: '/territory',
        // Self - own Admin profile (states/status/load).
        me: { method: GET, path: '/me' },
        // MASTER assigns/reassigns which state(s) an ADMIN owns.
        assign: { method: POST, path: '/:adminId/assign' },
        // Self (ACTIVE/ON_LEAVE) or MASTER (also SUSPENDED) toggles status.
        status: { method: PATCH, path: '/:adminId/status' },
        // MASTER - full India state -> admins -> status -> load overview.
        map: { method: GET, path: '/map' },
        // Eligible admins for one state, ACTIVE-first (resolution + admin UI).
        stateAdmins: { method: GET, path: '/state/:state' },
        // NOTE: `resolve` intentionally not exposed here - it's
        // service-to-service-only (organization-service's local mirror),
        // never frontend-facing.
      },
    },
  },
  media_service: {
    default: `/${SERVICE_NAMES_MAP.media}`,
    health: { method: GET, path: '/health' },
    wakeUp: { method: GET, path: '/wake-up' },
  },
  mail_service: {
    default: `/${SERVICE_NAMES_MAP.mail}`,
    health: { method: GET, path: '/health' },
    wakeUp: { method: GET, path: '/wake-up' },
  },
  product_service: {
    default: `/${SERVICE_NAMES_MAP.product}`,
    health: { method: GET, path: '/health' },
    wakeUp: { method: GET, path: '/wake-up' },
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
      // Admin review of a PENDING product - approve (-> PUBLISHED) or reject
      // (-> REJECTED, with a reason). Mirrors organization-service's
      // `seller.updateApprovalStatus` path shape.
      updateApprovalStatus: { method: PATCH, path: '/approval-status/:productId' },
      // "My Queue" - ?status=PENDING (default) & ?filter=mine|all|unassigned
      // (default `mine`; `all`/`unassigned` are MASTER-only).
      queue: { method: GET, path: '/queue' },
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
  organization_service: {
    default: `/${SERVICE_NAMES_MAP.organization}`,
    health: { method: GET, path: '/health' },
    wakeUp: { method: GET, path: '/wake-up' },
    contact: {
      base: '/contact',
      create: { method: POST, path: '/' },
      list: { method: GET, path: '/' },
      updateStatus: { method: PATCH, path: '/:ticketId' },
    },
    seller: {
      base: '/seller',
      updateApprovalStatus: { method: PATCH, path: '/approval-status/:sellerId' },
      // "My Queue" - ?status=PENDING (default) & ?filter=mine|all|unassigned
      queue: { method: GET, path: '/queue' },
      // Self - the applicant's own submitted application (any USER).
      me: { method: GET, path: '/me' },
      draft: {
        base: '/draft',
        save: { method: POST, path: '/' }, // For saving a wizard step as draft
        get: { method: GET, path: '/' }, // For fetching the existing draft to prefill the wizard
        submit: { method: PATCH, path: '/submit' }, // Reassembles the draft and creates the Seller as PENDING
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
