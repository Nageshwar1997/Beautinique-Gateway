import { envs } from '@/envs';

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
      manual: { method: 'POST', path: '/auth/login/manual' },
      oAuth: {
        google: {
          redirect: { method: 'GET', path: '/auth/login/oauth/google/redirect' },
          callback: { method: 'GET', path: '/auth/login/oauth/google/callback' },
        },
        github: {
          redirect: { method: 'GET', path: '/auth/login/oauth/github/redirect' },
          callback: { method: 'GET', path: '/auth/login/oauth/github/callback' },
        },
        linkedin: {
          redirect: { method: 'GET', path: '/auth/login/oauth/linkedin/redirect' },
          callback: { method: 'GET', path: '/auth/login/oauth/linkedin/callback' },
        },
      },
    },
    logout: { method: 'DELETE', path: '/auth/logout/:userId' },
    password: {},
    register: {},
  },
};
