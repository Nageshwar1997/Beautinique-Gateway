import { envs } from '../envs';

export const SERVICES_BASE_URLS = {
  'user-service': `${envs.url.service.user}/api/v1`,
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
    logout: { method: 'DELETE', url: '/auth/logout/:userId' },
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
      token: {
        base: '/token',
        refreshAccessToken: { path: '/refresh-access-token', method: 'post' },
      },
    },
    user: {
      base: '/user',
      session: { method: 'get', path: '/session' },
    },
  },
} as const;
