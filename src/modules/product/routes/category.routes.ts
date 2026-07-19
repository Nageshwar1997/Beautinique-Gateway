import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { authorize } from '../../../middlewares/index.js';
import {
  addCategoryController,
  deleteCategoryController,
  getCategoriesByHierarchyController,
  getCategoriesByParentLevelController,
  updateCategoryController,
} from '../controllers/index.js';

export const categoryRouter = Router();

const { get, add, update, delete: remove } = METHODS_AND_PATHS.product_service.category;

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
