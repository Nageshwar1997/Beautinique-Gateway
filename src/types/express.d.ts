import 'express-serve-static-core';

import type { IJwtPayload } from './index.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user?: IJwtPayload;
  }
}
