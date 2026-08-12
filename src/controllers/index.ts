import { AuthenticationError } from '@beautinique/backend-classes';
import type { TApiResponse } from '@beautinique/backend-types';
import axios, { isAxiosError } from 'axios';
import type { Request, Response } from 'express';

import { COOKIES_DATA, METHODS_AND_PATHS } from '../constants/index.js';
import { envs } from '../envs/index.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/index.js';

/**
 * Render's free tier spins a service down after inactivity, and a cold container can 502 on
 * the first request or two while it's still booting.
 *
 * IMPORTANT: retrying *fast* is actively harmful here - Render's edge rate-limits repeated
 * requests to a service (confirmed via the `debug` field below: rapid retries came back as
 * HTTP 429, not the underlying service's own response), so hammering a cold service with many
 * quick attempts gets the *gateway itself* rate-limited instead of ever reaching the service.
 * A single direct request reliably succeeds once the container is up. So this uses *few*
 * attempts with a *long* gap between them - enough real time for the container to finish
 * booting without tripping the rate limit.
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

        // TEMP DEBUG: surface the raw failure reason (axios error code/message, or the target
        // URL that was hit) so we can tell DNS failure / connection refused / timeout apart -
        // remove this `debug` field once the root cause is confirmed.
        return {
          service: name,
          status: 'DOWN',
          message: isAxiosError<TApiResponse>(error)
            ? (error.response?.data.message ?? null)
            : null,
          debug: isAxiosError(error)
            ? {
                code: error.code ?? null,
                message: error.message,
                url: `${url}${target.wakeUp.path}`,
                httpStatus: error.response?.status ?? null,
              }
            : { message: error instanceof Error ? error.message : JSON.stringify(error) },
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
