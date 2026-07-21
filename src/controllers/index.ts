import { AuthenticationError } from '@beautinique/backend-classes';
import axios, { isAxiosError } from 'axios';
import type { Request, Response } from 'express';

import { COOKIES_DATA, METHODS_AND_PATHS } from '../constants/index.js';
import { envs } from '../envs/index.js';
import type { TApiResponse } from '../types/index.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/index.js';

/**
 * Render's free tier spins a service down after inactivity - a sleeping service takes
 * *at least* ~50s to cold-start (sometimes more), and the connection can fail once before
 * the container finishes booting. The timeout is set well above that floor, plus a couple
 * of delayed retries, so a slow-but-legitimate wake-up isn't reported down too early.
 *
 * None of the downstream services expose a dedicated "/wake-up" route (only `/health`) -
 * that path only exists on this gateway itself, so pinging `/health` on each of them is
 * what actually reaches (and wakes) them.
 */
const HEALTH_CHECK_TIMEOUT = 75_000;
const HEALTH_CHECK_RETRIES = 2;
const HEALTH_CHECK_RETRY_DELAY = 5_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const pingServiceHealth = async (url: string) => {
  const target = `${url}${METHODS_AND_PATHS.health.path}`;

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= HEALTH_CHECK_RETRIES; attempt++) {
    try {
      const { data } = await axios[METHODS_AND_PATHS.health.method]<TApiResponse>(target, {
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
        const { data, error } = await pingServiceHealth(url);

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
        const { data, error } = await pingServiceHealth(url);

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
