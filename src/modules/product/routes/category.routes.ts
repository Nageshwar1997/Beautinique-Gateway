import { tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import { addCategoryController, getCategoriesByParentLevelController } from '../controllers';

export const categoryRouter = Router();

const { get, add } = GATEWAY_METHODS_AND_PATHS.product.category;

categoryRouter[add.method](
  add.path,
  authorize(['ADMIN', 'MASTER']),
  tryCatchResponse(addCategoryController),
);

categoryRouter[get.getByParentLevel.method](
  get.getByParentLevel.path,
  authorize(['ADMIN', 'SELLER', 'MASTER']),
  tryCatchResponse(getCategoriesByParentLevelController),
);
