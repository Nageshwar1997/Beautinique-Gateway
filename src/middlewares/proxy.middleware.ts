import type { Request, Response } from 'express';
import proxy from 'http-proxy';
import type { ServerResponse } from 'node:http';
import { HEADERS_KEYS, SERVICES_BASE_URLS } from '../constants';
import { getUser } from '../utils';
import { logger } from './logger.middleware';

const mediaProxy = proxy.createProxyServer<Request, Response>({
  target: `${SERVICES_BASE_URLS['media-service']}/api/v1`,
  changeOrigin: true,
  xfwd: true,
  proxyTimeout: 30000,
  timeout: 30000,
});

const isServerResponse = (res: ServerResponse | unknown): res is ServerResponse =>
  typeof res === 'object' && res !== null && 'writeHead' in res && 'end' in res;

mediaProxy.on('proxyReq', (proxyReq, req) => {
  const { _id, role } = getUser(req);
  proxyReq.setHeader(HEADERS_KEYS.userId, _id);
  proxyReq.setHeader(HEADERS_KEYS.userRole, role);
});

mediaProxy.on('error', (err, req, res) => {
  logger.error(`Media service proxy failed for ${req.method} ${req.url}: ${err.message}`);

  if (!isServerResponse(res) || res.headersSent) return;

  res.writeHead(502, { [HEADERS_KEYS.contentType]: 'application/json' });
  res.end(JSON.stringify({ success: false, message: 'Media service is currently unavailable' }));
});

export const mediaServiceProxy = (req: Request, res: Response) => {
  mediaProxy.web(req, res);
};
