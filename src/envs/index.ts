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
  is_dev: (process.env.IS_DEV as string) === 'true',

  // J
  // K
  // L
  // M
  mongo_uri: {
    prod: process.env.MONGODB_PROD_URI as string,
    dev: process.env.MONGODB_DEV_URI as string,
  },

  // N
  // O
  // P
  port: Number(process.env.PORT as string),

  // Q
  // R
  // S
  service: {
    user: process.env.USER_SERVICE_BASE_URL as string,
  },

  // T
  // U
  url: {
    gateway: {
      dev: process.env.BACKEND_DEV_URL as string,
      prod: process.env.BACKEND_PROD_URL as string,
    },
    frontend: {
      dev: {
        client: process.env.FRONTEND_DEV_CLIENT_URL as string,
        admin: process.env.FRONTEND_DEV_ADMIN_URL as string,
        master: process.env.FRONTEND_DEV_MASTER_URL as string,
        public1: process.env.FRONTEND_DEV_PUBLIC_URL_1 as string,
        public2: process.env.FRONTEND_DEV_PUBLIC_URL_2 as string,
      },
      prod: {
        client: process.env.FRONTEND_PROD_CLIENT_URL as string,
        admin: process.env.FRONTEND_PROD_ADMIN_URL as string,
        master: process.env.FRONTEND_PROD_MASTER_URL as string,
      },
    },
  },

  // V
  // W
  // X
  // Y
  // Z
};
