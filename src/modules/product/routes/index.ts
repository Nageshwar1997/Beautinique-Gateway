import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../constants';
import { categoryRouter } from './category.routes';

export const productServiceRouter = Router();

const { category } = METHODS_AND_PATHS.product_service;

productServiceRouter.use(category.base, categoryRouter);
