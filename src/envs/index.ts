const {
  // A

  ADMIN_DEV_URL,
  ADMIN_PROD_URL,

  // B
  // C

  CLIENT_DEV_URL,
  CLIENT_PROD_URL,

  // D
  // E
  // F
  // G

  GATEWAY_DEV_URL,
  GATEWAY_PROD_URL,

  // H
  // I

  IS_DEV,

  // J
  // K
  // L
  // M

  MAIL_SERVICE_DEV_URL,
  MAIL_SERVICE_PROD_URL,

  MASTER_DEV_URL,
  MASTER_PROD_URL,

  MEDIA_SERVICE_DEV_URL,
  MEDIA_SERVICE_PROD_URL,

  // N
  // O
  // P

  PORT,

  PUBLIC_DEV_URL_1,
  PUBLIC_DEV_URL_2,

  // Q
  // R
  // S
  // T
  // U

  USER_SERVICE_DEV_URL,
  USER_SERVICE_PROD_URL,

  // V
  // W

  WORKER_SERVICE_DEV_URL,
  WORKER_SERVICE_PROD_URL,

  // X
  // Y
  // Z
} = process.env as Record<string, string>;

const is_dev = IS_DEV === 'true';

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

  is_dev,

  // J
  // K
  // L
  // M
  // N
  // O
  // P

  port: Number(PORT),

  // Q
  // R
  // S
  // T
  // U

  url: {
    frontend: {
      client: is_dev ? CLIENT_DEV_URL : CLIENT_PROD_URL,
      admin: is_dev ? ADMIN_DEV_URL : ADMIN_PROD_URL,
      master: is_dev ? MASTER_DEV_URL : MASTER_PROD_URL,
      public1: PUBLIC_DEV_URL_1,
      public2: PUBLIC_DEV_URL_2,
    },
    gateway: is_dev ? GATEWAY_DEV_URL : GATEWAY_PROD_URL,
    service: {
      mail: is_dev ? MAIL_SERVICE_DEV_URL : MAIL_SERVICE_PROD_URL,
      media: is_dev ? MEDIA_SERVICE_DEV_URL : MEDIA_SERVICE_PROD_URL,
      user: is_dev ? USER_SERVICE_DEV_URL : USER_SERVICE_PROD_URL,
      worker: is_dev ? WORKER_SERVICE_DEV_URL : WORKER_SERVICE_PROD_URL,
    },
  },

  // V
  // W
  // X
  // Y
  // Z
};
