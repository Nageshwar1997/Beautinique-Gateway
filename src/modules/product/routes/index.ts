import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../constants';
import { categoryRouter } from './category.routes';
import { productRouter } from './product.routes';

export const productServiceRouter = Router();

const { category, product } = METHODS_AND_PATHS.product_service;

productServiceRouter.use(category.base, categoryRouter);
productServiceRouter.use(product.base, productRouter);
