import 'express-serve-static-core';
import type { IJwtPayload } from '.';

declare module 'express-serve-static-core' {
  interface Response {
    success: (statusCode: number, message: string, data?: object) => void;
  }
  interface Request {
    requestId?: string;
    user?: IJwtPayload;
  }
}
