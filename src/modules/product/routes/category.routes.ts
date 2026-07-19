import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import { categoryUpdateZodSchema, categoryZodSchema, validateZod } from '@beautinique/backend-zod';
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
  validateZod({ body: categoryZodSchema }),
  tryCatchResponse(addCategoryController),
);

categoryRouter[update.method](
  update.path,
  authorize(['ADMIN', 'MASTER']),
  checkEmptyRequest({ body: true, params: true }),
  validateZod({ body: categoryUpdateZodSchema }),
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
  authorize(['ADMIN', 'MASTER', 'SELLER']),
  tryCatchResponse(getCategoriesByParentLevelController),
);

categoryRouter[get.byHierarchy.method](
  get.byHierarchy.path,
  tryCatchResponse(getCategoriesByHierarchyController),
);
