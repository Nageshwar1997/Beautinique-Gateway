import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { contactRouter } from './contact.routes.js';
import { sellerRouter } from './seller.routes.js';

export const organizationServiceRouter = Router();

const { contact, seller } = METHODS_AND_PATHS.organization_service;

organizationServiceRouter.use(contact.base, contactRouter);
organizationServiceRouter.use(seller.base, sellerRouter);
