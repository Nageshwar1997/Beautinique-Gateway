import { Router } from 'express';
import { ROUTES } from '../../../constants';
import { categoryRouter } from './category.routes';

export const productServiceRouter = Router();

const { category } = ROUTES.product_service;

productServiceRouter.use(category.base, categoryRouter);
