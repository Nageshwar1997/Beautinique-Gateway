import type { Response } from 'express';
import proxy from 'http-proxy';
import querystring from 'node:querystring';
import type { ClientRequest, ServerResponse } from 'node:http';

import { SERVICES_BASE_URLS } from '../constants';
import { logger } from './logger.middleware';
import type { AuthRequest } from '../types';

const mediaProxy = proxy.createProxyServer<AuthRequest, Response>({
  target: SERVICES_BASE_URLS['media-service'],
  changeOrigin: true,
  xfwd: true,
});

const fixRequestBody = (proxyReq: ClientRequest, req: AuthRequest) => {
  if (req.readableLength !== 0 || !req.body) return;

  const contentType = req.headers['content-type'];
  if (!contentType) return;

  let bodyData: string | undefined;

  if (contentType.includes('application/json') || contentType.includes('+json')) {
    bodyData = JSON.stringify(req.body);
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    bodyData = querystring.stringify(req.body as Record<string, string>);
  } else if (contentType.includes('text/plain')) {
    bodyData = String(req.body);
  }

  if (!bodyData) return;

  proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
  proxyReq.write(bodyData);
};

const isServerResponse = (res: ServerResponse | unknown): res is ServerResponse =>
  typeof res === 'object' && res !== null && 'writeHead' in res && 'end' in res;

mediaProxy.on('proxyReq', fixRequestBody);

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
