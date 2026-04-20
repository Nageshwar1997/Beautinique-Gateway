import { envs } from '@/envs';

export const SERVICES_BASE_URLS = {
  'user-service': `${envs.service.user}/user-service/api/v1`,
} as const;

export const ORIGINS = [
  envs.url.frontend.prod.client,
  envs.url.frontend.prod.admin,
  envs.url.frontend.prod.master,
  envs.url.frontend.dev.client,
  envs.url.frontend.dev.admin,
  envs.url.frontend.dev.master,
  envs.url.frontend.dev.public1,
  envs.url.frontend.dev.public2,
];

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
    logout: { method: 'DELETE', url: '/auth/logout/:userId' },
    password: {},
    register: {
      sendOtp: { method: 'POST', url: '/auth/register/send-otp' },
    },
  },
};

export const GATEWAY_METHODS_AND_PATHS = {
  user: {
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
      logout: {
        base: '/logout',
        default: { path: '/:userId', method: 'delete' },
      },
      register: {
        base: '/register',
        sendOtp: { path: '/send-otp', method: 'post' },
      },
      password: {
        base: '/password',
      },
    },
    user: {
      base: '/users',
    },
  },
} as const;
