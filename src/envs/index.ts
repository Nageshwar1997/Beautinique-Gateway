import { requireEnv, requirePort } from '@beautinique/shared-utils';

const {
  // A

  ADMIN_BASE_URL,

  // B
  // C

  CLIENT_BASE_URL,

  // D
  // E
  // F
  // G

  GATEWAY_BASE_URL,

  // H
  // I
  // J

  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,

  // K
  // L
  // M

  MAIL_SERVICE_BASE_URL,
  MAIL_SERVICE_SECRET,

  MASTER_BASE_URL,

  MEDIA_SERVICE_BASE_URL,
  MEDIA_SERVICE_SECRET,

  // N

  NODE_ENV,

  // O
  // P

  PORT,

  PRODUCT_SERVICE_BASE_URL,

  PRODUCT_SERVICE_SECRET,

  // Q
  // R
  // S

  SELLER_BASE_URL,

  // T
  // U

  USER_SERVICE_BASE_URL,

  USER_SERVICE_SECRET,

  // V
  // W
  // X
  // Y
  // Z
} = process.env as Record<string, string>;

export const envs = {
  // A
  // B
  // C
  // D
  // E
  // F
  // G
  // H
  // I

  is_dev: NODE_ENV === 'development',

  // J

  jwt: {
    access_secret: requireEnv(JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
    refresh_secret: requireEnv(JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  },

  // K
  // L
  // M
  // N
  // O
  // P

  port: requirePort(PORT, 'PORT'),

  // Q
  // R
  // S

  service_secret: {
    user: requireEnv(USER_SERVICE_SECRET, 'USER_SERVICE_SECRET'),
    product: requireEnv(PRODUCT_SERVICE_SECRET, 'PRODUCT_SERVICE_SECRET'),
    mail: requireEnv(MAIL_SERVICE_SECRET, 'MAIL_SERVICE_SECRET'),
    media: requireEnv(MEDIA_SERVICE_SECRET, 'MEDIA_SERVICE_SECRET'),
  },

  // T
  // U

  url: {
    frontend: {
      client: requireEnv(CLIENT_BASE_URL, 'CLIENT_BASE_URL'),
      admin: requireEnv(ADMIN_BASE_URL, 'ADMIN_BASE_URL'),
      master: requireEnv(MASTER_BASE_URL, 'MASTER_BASE_URL'),
      seller: requireEnv(SELLER_BASE_URL, 'SELLER_BASE_URL'),
    },
    gateway: requireEnv(GATEWAY_BASE_URL, 'GATEWAY_BASE_URL'),
    service: {
      mail: requireEnv(MAIL_SERVICE_BASE_URL, 'MAIL_SERVICE_BASE_URL'),
      media: requireEnv(MEDIA_SERVICE_BASE_URL, 'MEDIA_SERVICE_BASE_URL'),
      product: requireEnv(PRODUCT_SERVICE_BASE_URL, 'PRODUCT_SERVICE_BASE_URL'),
      user: requireEnv(USER_SERVICE_BASE_URL, 'USER_SERVICE_BASE_URL'),
    },
  },

  // V
  // W
  // X
  // Y
  // Z
};
