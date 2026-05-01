import { AppError } from '@beautinique/be-classes';
import type { Request, Response } from 'express';
import { envs } from '../envs';

export const healthController = async (_req: Request, res: Response) => {
  try {
    const services = envs.url.service;

    const results = await Promise.allSettled(
      Object.entries(services).map(async ([name, url]) => {
        try {
          const response = await fetch(`${url}/health`);
          return { service: name, status: response.ok ? 'UP' : 'DOWN' };
        } catch {
          return { service: name, status: 'DOWN' };
        }
      }),
    );

    const formatted = results.map((r) =>
      r.status === 'fulfilled' ? r.value : { service: 'unknown', status: 'DOWN' },
    );

    const allUp = formatted.every((s) => s.status === 'UP');
    return res.success(allUp ? 200 : 500, 'Beautinique Gateway is healthy', {
      gateway: 'UP',
      services: formatted,
    });
  } catch (err) {
    throw new AppError({
      message: 'Gateway is down',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
      globalErrors: [(err as Error).message || 'Something went wrong!'],
    });
  }
};
