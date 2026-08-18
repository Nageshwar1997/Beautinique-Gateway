import type { ServerResponse } from 'node:http';

import { HEADERS_MAP, SERVICE_NAMES_MAP } from '@beautinique/backend-constants';
import type { Request, Response } from 'express';
import proxy from 'http-proxy';

import { logger } from '../configs/index.js';
import { METHODS_AND_PATHS, SERVICE_SECRET_MAP, SERVICES_BASE_URLS } from '../constants/index.js';
import { getAuthUser } from '../utils/index.js';

const mediaProxy = proxy.createProxyServer<Request, Response>({
  target: `${SERVICES_BASE_URLS[SERVICE_NAMES_MAP.media]}${METHODS_AND_PATHS.base}`,
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: 30000,
  timeout: 30000,
});

const isServerResponse = (res: unknown): res is ServerResponse =>
  typeof res === 'object' && res !== null && 'writeHead' in res && 'end' in res;

mediaProxy.on('proxyReq', (proxyReq, req) => {
  const { _id, role } = getAuthUser(req.user);

  proxyReq.setHeader(HEADERS_MAP.serviceSecret, SERVICE_SECRET_MAP[SERVICE_NAMES_MAP.media]);
  proxyReq.setHeader(HEADERS_MAP.userId, _id);
  proxyReq.setHeader(HEADERS_MAP.userRole, role);
});

mediaProxy.on('error', (err, req, res) => {
  logger.error(`Media service proxy failed for ${req.method} ${req.url}: ${err.message}`);

  if (!isServerResponse(res) || res.headersSent) return;

  res.writeHead(502, { [HEADERS_MAP.contentType]: 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Media service is currently unavailable' }));
});

export const mediaServiceProxy = (req: Request, res: Response) => {
  mediaProxy.web(req, res);
};
