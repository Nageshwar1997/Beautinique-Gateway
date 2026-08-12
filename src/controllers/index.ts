import { AuthenticationError } from '@beautinique/backend-classes';
import type { TApiResponse } from '@beautinique/backend-types';
import axios, { isAxiosError } from 'axios';
import type { Request, Response } from 'express';

import { COOKIES_DATA, METHODS_AND_PATHS } from '../constants/index.js';
import { envs } from '../envs/index.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/index.js';

/**
 * Used by `healthController` (`/overall-health`) only - that route is a manual/diagnostic
 * check, so it's fine to block and retry for a genuine answer. `wakeUpController` (the
 * twice-daily cron target) doesn't use this - see the comment on it for why.
 *
 * Render's free tier spins a service down after inactivity, and a cold container can 429/502
 * for a while (observed anywhere from ~90s to 300s+) before Render's edge starts routing to
 * it - retrying *fast* makes this worse (rapid retries got 429'd), so this uses *few* attempts
 * with a *long* gap between them instead.
 */
const HEALTH_CHECK_TIMEOUT = 75_000;
const HEALTH_CHECK_RETRIES = 2;
const HEALTH_CHECK_RETRY_DELAY = 45_000;

// Maps each `envs.url.service` key to its constants block, so pinging uses each service's
// own `health`/`wakeUp` path instead of assuming every service shares the gateway's own.
const SERVICE_METHODS_AND_PATHS = {
  mail: METHODS_AND_PATHS.mail_service,
  media: METHODS_AND_PATHS.media_service,
  product: METHODS_AND_PATHS.product_service,
  user: METHODS_AND_PATHS.user_service,
  organization: METHODS_AND_PATHS.organization_service,
} as const;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const pingService = async (url: string, target: { method: 'get'; path: string }) => {
  const endpoint = `${url}${target.path}`;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= HEALTH_CHECK_RETRIES; attempt++) {
    try {
      const { data } = await axios[target.method]<TApiResponse>(endpoint, {
        timeout: HEALTH_CHECK_TIMEOUT,
      });

      return { data, error: null };
    } catch (error) {
      lastError = error;

      if (attempt < HEALTH_CHECK_RETRIES) {
        await sleep(HEALTH_CHECK_RETRY_DELAY);
      }
    }
  }

  return { data: null, error: lastError };
};

/**
 * A single request is enough to trigger Render's cold-start provisioning for a sleeping
 * service - waiting for (or retrying until) a *confirmed successful* response doesn't help,
 * since Render's own edge can 429/502 an incoming request while the container is still coming
 * up, independent of how many times or how patiently the gateway asks (observed anywhere from
 * ~90s to 300s+, and not reliably fixed by more/longer retries). So this fires one ping per
 * service and returns immediately, instead of blocking the caller (the twice-daily cron, or
 * the frontend's boot-time ping) on that unpredictable window. The underlying wake-up still
 * happens in the background regardless of whether these pings individually succeed.
 */
export const wakeUpController = (_req: Request, res: Response) => {
  const services = envs.url.service;

  Object.entries(services).forEach(([name, url]) => {
    const target = SERVICE_METHODS_AND_PATHS[name as keyof typeof SERVICE_METHODS_AND_PATHS];

    void axios[target.wakeUp.method](`${url}${target.wakeUp.path}`, {
      timeout: HEALTH_CHECK_TIMEOUT,
    }).catch(() => {
      // Expected while cold (Render's edge returns 429/502 before the container is routable) -
      // the request still reached Render and triggered provisioning either way.
    });
  });

  res.status(200).json({
    message: 'Wake-up triggered for every service',
    status: 'TRIGGERED',
    gateway: 'UP',
    services: Object.keys(services),
  });
};

export const healthController = async (_req: Request, res: Response) => {
  try {
    const services = envs.url.service;

    const results = await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
        const target = SERVICE_METHODS_AND_PATHS[name as keyof typeof SERVICE_METHODS_AND_PATHS];
        const { data, error } = await pingService(url, target.health);

        if (!error) {
          return { service: name, status: 'HEALTHY', response: data };
        }

        return {
          service: name,
          status: 'UNHEALTHY',
          response: isAxiosError<TApiResponse>(error) ? (error.response?.data ?? null) : null,
        };
      }),
    );

    const allHealthy = results.every((service) => service.status === 'HEALTHY');
    const allUnhealthy = results.every((service) => service.status === 'UNHEALTHY');

    const overallStatus = allHealthy ? 'HEALTHY' : allUnhealthy ? 'UNHEALTHY' : 'DEGRADED';

    res.status(200).json({
      message: 'Gateway is healthy and running',
      status: overallStatus,
      gateway: 'HEALTHY',
      services: results,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Gateway is unhealthy',
      status: 'UNHEALTHY',
      gateway: 'UNHEALTHY',
      services: [],
      error: err instanceof Error ? err.message : 'Something went wrong!',
    });
  }
};

/* ================================ REFRESH CONTROLLERS ================================ */

// eslint-disable-next-line @typescript-eslint/require-await
export const refreshAccessTokenController = async (req: Request, res: Response) => {
  const token = req.cookies[COOKIES_DATA.refresh_token.name] as string | undefined;

  if (!token) {
    throw new AuthenticationError('Refresh token missing');
  }

  const { _id, role } = verifyRefreshToken(token);

  const newAccessToken = generateAccessToken({ _id, role });

  res.cookie(COOKIES_DATA.access_token.name, newAccessToken, COOKIES_DATA.access_token.options);

  res.success({ message: 'Access token refreshed' });
};
