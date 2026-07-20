import { AuthenticationError } from '@beautinique/backend-classes';
import axios from 'axios';
import type { Request, Response } from 'express';

import { COOKIES_DATA } from '../constants/index.js';
import { envs } from '../envs/index.js';
import type { TApiResponse } from '../types/index.js';
import { generateAccessToken, verifyRefreshToken } from '../utils/index.js';

export const wakeUpController = async (_req: Request, res: Response) => {
  try {
    const services = envs.url.service;

    const results = await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
        try {
          const { data } = await axios.get<TApiResponse>(`${url}/health`);
          return { service: name, status: 'UP', response: data };
        } catch (error) {
          return {
            service: name,
            status: 'DOWN',
            response: axios.isAxiosError<TApiResponse>(error)
              ? (error.response?.data ?? null)
              : null,
          };
        }
      }),
    );

    const allUp = results.every((service) => service.status === 'UP');
    const allDown = results.every((service) => service.status === 'DOWN');

    const overallStatus = allUp ? 'UP' : allDown ? 'DOWN' : 'DEGRADED';

    res.status(200).json({
      status: overallStatus,
      gateway: 'UP',
      services: results,
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      gateway: 'DOWN',
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
