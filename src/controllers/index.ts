import { AuthenticationError } from '@beautinique/backend-classes';
import type { TApiResponse } from '@beautinique/backend-types';
import axios, { isAxiosError } from 'axios';
import type { Request, Response } from 'express';

import { COOKIES_DATA, METHODS_AND_PATHS } from '../constants/index.js';
import { envs } from '../envs/index.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/index.js';

/**
 * A single request is all that's needed - and all that reliably works. Retrying (even slowly,
 * a few times minutes apart) was tested extensively and made things *worse*: repeated requests
 * to the same service in a short window get Render's edge to return 429 ("Too Many Requests"),
 * which looks like the service is down even when a single clean request right after proves
 * it's actually healthy and fast (confirmed directly, bypassing this controller entirely).
 * So: one request, report whatever it says, done.
 */
const REQUEST_TIMEOUT = 75_000;

// Maps each `envs.url.service` key to its constants block, so pinging uses each service's own
// `health`/`wakeUp` path instead of assuming every service shares the gateway's own.
const SERVICE_METHODS_AND_PATHS = {
  mail: METHODS_AND_PATHS.mail_service,
  media: METHODS_AND_PATHS.media_service,
  product: METHODS_AND_PATHS.product_service,
  user: METHODS_AND_PATHS.user_service,
  organization: METHODS_AND_PATHS.organization_service,
} as const;

/**
 * Single request per service, no retries (see the note above `REQUEST_TIMEOUT`) - this is a
 * manual/diagnostic snapshot of what each service's `/health` says *right now*, not a
 * wait-until-ready check.
 */
export const healthController = async (_req: Request, res: Response) => {
  try {
    const services = envs.url.service;

    const results = await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
        const target = SERVICE_METHODS_AND_PATHS[name as keyof typeof SERVICE_METHODS_AND_PATHS];

        try {
          const { data } = await axios[target.health.method]<TApiResponse>(
            `${url}${target.health.path}`,
            { timeout: REQUEST_TIMEOUT },
          );

          return { service: name, status: 'HEALTHY', response: data };
        } catch (error) {
          return {
            service: name,
            status: 'UNHEALTHY',
            response: isAxiosError<TApiResponse>(error) ? (error.response?.data ?? null) : null,
          };
        }
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
