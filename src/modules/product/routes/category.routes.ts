import { checkEmptyRequest, tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import {
  addCategoryController,
  deleteCategoryController,
  getCategoriesByHierarchyController,
  getCategoriesByParentLevelController,
  updateCategoryController,
} from '../controllers';

export const categoryRouter = Router();

const { get, add, update, delete: remove } = GATEWAY_METHODS_AND_PATHS.product.category;

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

categoryRouter[remove.method](
  remove.path,
  authorize(['ADMIN', 'MASTER']),
  checkEmptyRequest({ params: true }),
  tryCatchResponse(deleteCategoryController),
);

categoryRouter[get.byParentLevel.method](
  get.byParentLevel.path,
  authorize(['ADMIN', 'SELLER', 'MASTER']),
  tryCatchResponse(getCategoriesByParentLevelController),
);

categoryRouter[get.byHierarchy.method](
  get.byHierarchy.path,
  tryCatchResponse(getCategoriesByHierarchyController),
);
