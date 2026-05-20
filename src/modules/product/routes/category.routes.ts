import { checkEmptyRequest, tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import {
  addCategoryController,
  getCategoriesByParentLevelController,
  updateCategoryController,
} from '../controllers';

export const categoryRouter = Router();

const { get, add, update } = GATEWAY_METHODS_AND_PATHS.product.category;

categoryRouter[add.method](
  add.path,
  authorize(['ADMIN', 'MASTER']),
  checkEmptyRequest({ body: true }),
  tryCatchResponse(addCategoryController),
);

categoryRouter[update.method](
  update.path,
  authorize(['ADMIN', 'MASTER']),
  checkEmptyRequest({ body: true }),
  tryCatchResponse(updateCategoryController),
);

categoryRouter[get.getByParentLevel.method](
  get.getByParentLevel.path,
  authorize(['ADMIN', 'SELLER', 'MASTER']),
  checkEmptyRequest({ query: true }),
  tryCatchResponse(getCategoriesByParentLevelController),
);
