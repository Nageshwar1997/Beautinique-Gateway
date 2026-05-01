import type { Request, Response } from 'express';
import { envs } from '../envs';

export const wakeUpController = async (_req: Request, res: Response) => {
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
    const anyDown = formatted.some((s) => s.status === 'DOWN');

    let overallStatus = 'UP';

    if (!allUp && anyDown) {
      overallStatus = 'DEGRADED';
    }

    res.status(200).json({
      status: overallStatus,
      gateway: 'UP',
      services: formatted,
    });
  } catch (err) {
    res.status(500).json({
      status: 'DOWN',
      gateway: 'DOWN',
      services: [],
      error: (err as Error).message || 'Something went wrong!',
    });
  }
};
