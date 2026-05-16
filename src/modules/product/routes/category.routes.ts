import { tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../constants';
import { getAllCategoriesController } from '../controllers';

export const categoryRouter = Router();

const { get } = GATEWAY_METHODS_AND_PATHS.product.category;

categoryRouter[get.all.method](get.all.path, tryCatchResponse(getAllCategoriesController));
