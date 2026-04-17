import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';

export const logoutRouter = Router();

const { logout } = GATEWAY_METHODS_AND_PATHS.user.auth;

logoutRouter[logout.default.method](logout.default.path, async () => {});
