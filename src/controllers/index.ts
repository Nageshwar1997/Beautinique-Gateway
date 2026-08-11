import { AuthenticationError } from '@beautinique/backend-classes';
import type { TApiResponse } from '@beautinique/backend-types';
import axios, { isAxiosError } from 'axios';
import type { Request, Response } from 'express';

import { COOKIES_DATA, METHODS_AND_PATHS } from '../constants/index.js';
import { envs } from '../envs/index.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/index.js';

/**
 * Render's free tier spins a service down after inactivity. Measured cold-start time for
 * these services (from a genuinely-asleep state) varies run to run - observed anywhere from
 * ~113s up to 220s+, notably higher and less predictable than Render's commonly-cited ~50-75s
 * floor (likely shared/oversubscribed free-tier compute). A request to a cold service also
 * fails *fast* (an immediate error while the container is still booting) rather than hanging
 * for the full timeout - so the retry *count x delay* needs to add up to a window with real
 * margin over the worst observed case, not rely on each attempt eating the timeout on its own.
 * HEALTH_CHECK_TIMEOUT stays high as a safety cap for the rarer case where an attempt
 * genuinely hangs instead of failing fast.
 *
 * Every downstream service exposes both `/health` (checks its DB connection too) and a
 * lighter `/wake-up` (no DB dependency - just proves the container is awake). Wake-up pings
 * hit each service's own `/wake-up`; health checks hit `/health`.
 */
const HEALTH_CHECK_TIMEOUT = 75_000;
const HEALTH_CHECK_RETRIES = 14;
const HEALTH_CHECK_RETRY_DELAY = 20_000;

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

export const wakeUpController = async (_req: Request, res: Response) => {
  try {
    const services = envs.url.service;

    const results = await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
        const target = SERVICE_METHODS_AND_PATHS[name as keyof typeof SERVICE_METHODS_AND_PATHS];
        const { data, error } = await pingService(url, target.wakeUp);

        if (!error) {
          return { service: name, status: 'UP', message: data?.message ?? null };
        }

        return {
          service: name,
          status: 'DOWN',
          message: isAxiosError<TApiResponse>(error)
            ? (error.response?.data.message ?? null)
            : null,
        };
      }),
    );

    const allUp = results.every((service) => service.status === 'UP');
    const allDown = results.every((service) => service.status === 'DOWN');

    const overallStatus = allUp ? 'UP' : allDown ? 'DOWN' : 'DEGRADED';

    res.status(200).json({
      message: 'Gateway is up and running',
      status: overallStatus,
      gateway: 'UP',
      services: results,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Gateway is down',
      status: 'DOWN',
      gateway: 'DOWN',
      services: [],
      error: err instanceof Error ? err.message : 'Something went wrong!',
    });
  }
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
