import type { Response } from 'express';
import proxy from 'http-proxy';
import type { ServerResponse } from 'node:http';
import { SERVICES_BASE_URLS } from '../constants';
import type { AuthRequest } from '../types';
import { logger } from './logger.middleware';

const mediaProxy = proxy.createProxyServer<AuthRequest, Response>({
  target: SERVICES_BASE_URLS['media-service'],
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: 30000,
  timeout: 30000,
});

const isServerResponse = (res: ServerResponse | unknown): res is ServerResponse =>
  typeof res === 'object' && res !== null && 'writeHead' in res && 'end' in res;

mediaProxy.on('proxyReq', (proxyReq, req) => {
  if (req.user) {
    proxyReq.setHeader('X-User-Id', req.user._id);
    proxyReq.setHeader('X-User-Role', req.user.role);
  }
});

mediaProxy.on('error', (err, req, res) => {
  logger.error(`Media service proxy failed for ${req.method} ${req.url}: ${err.message}`);

  if (!isServerResponse(res) || res.headersSent) return;

  res.writeHead(502, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      success: false,
      message: 'Media service is currently unavailable',
    }),
  );
});

export const mediaServiceProxy = (req: AuthRequest, res: Response) => {
  mediaProxy.web(req, res);
};
