import { TooManyRequestsError } from '@beautinique/backend-classes';
import { rateLimit } from 'express-rate-limit';

import { logger } from '../configs/index.js';

interface ICreateLimiterOptions {
  windowMs: number;
  /** Max requests per IP per window. */
  limit: number;
  message: string;
}

const MINUTE = 60 * 1000;

/**
 * In-memory counters, keyed by client IP (`req.ip` - see `trust proxy` in `app.ts`, without which
 * every visitor would share Render's proxy IP). That's enough while the gateway runs as a single
 * instance (Render free tier); with several instances each would count on its own, and a shared
 * store (e.g. `rate-limit-redis`) would be needed.
 *
 * Rejects through `next(TooManyRequestsError)` so the 429 uses the same error JSON as every other
 * failure (`errorResponse` in `app.ts`), and sends the standard `RateLimit-*` / `Retry-After`
 * headers so the frontend (and well-behaved clients) can back off.
 */
const createLimiter = ({ windowMs, limit, message }: ICreateLimiterOptions) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, _res, next) => {
      logger.warn(
        `Rate limit exceeded: ${req.method} ${req.originalUrl} from ${req.ip ?? 'unknown'}`,
      );

      next(new TooManyRequestsError(message));
    },
  });

/**
 * Every `/api/v1` call (including the media-service proxy). Generous - a normal page load fires a
 * handful of requests - this only stops a single IP from hammering the whole API.
 */
export const apiRateLimiter = createLimiter({
  windowMs: MINUTE,
  limit: 120,
  message: 'Too many requests. Please slow down and try again in a minute.',
});

/**
 * Login, register, OTP and forgot-password (`/api/v1/user-service/auth/**`) - tight, because this
 * is where brute-forcing a password/OTP and spamming OTP emails (each one is a real email sent)
 * happens. Stacks on top of `apiRateLimiter`.
 */
export const authRateLimiter = createLimiter({
  windowMs: 15 * MINUTE,
  limit: 20,
  message: 'Too many attempts. Please wait 15 minutes before trying again.',
});

/**
 * `/overall-health` fans out to every service and waits for each one (up to ~75s each) - one
 * request there is expensive, so it's capped hard.
 */
export const overallHealthRateLimiter = createLimiter({
  windowMs: MINUTE,
  limit: 5,
  message: 'Too many health checks. Please try again in a minute.',
});
