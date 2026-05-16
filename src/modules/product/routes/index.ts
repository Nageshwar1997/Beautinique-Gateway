import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../constants';
import { categoryRouter } from './category.routes';

export const productServiceRouter = Router();

const { category } = GATEWAY_METHODS_AND_PATHS.product;

productServiceRouter.use(category.base, categoryRouter);
