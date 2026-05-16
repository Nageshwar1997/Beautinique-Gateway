import { tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import { getCategoriesByParentLevelController } from '../controllers';

export const categoryRouter = Router();

const { get } = GATEWAY_METHODS_AND_PATHS.product.category;

categoryRouter[get.getByParentLevel.method](
  get.getByParentLevel.path,
  authorize(['ADMIN', 'SELLER', 'MASTER']),
  tryCatchResponse(getCategoriesByParentLevelController),
);
