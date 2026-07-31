import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { contactRouter } from './contact-routes/index.js';

export const organizationServiceRouter = Router();
const { contact } = METHODS_AND_PATHS.organization_service;

organizationServiceRouter.use(contact.base, contactRouter);
