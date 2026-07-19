import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import { draftProductStepBodyZodSchema, validateZod } from '@beautinique/backend-zod';
import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { authorize } from '../../../middlewares/index.js';
import {
  getDashboardProductBySlugController,
  getDashboardProductsController,
  getDraftProductController,
  getProductBySlugController,
  getProductsSuggestionsController,
  publishDraftProductController,
  saveDraftProductController,
} from '../controllers/product.controller.js';

export const productRouter = Router();
const draftRouter = Router();
const dashboardRouter = Router();
const { draft, get } = METHODS_AND_PATHS.product_service.product;

/* ================== DRAFT ROUTES ================ */

draftRouter[draft.save.method](
  draft.save.path,
  checkEmptyRequest({ body: true }),
  validateZod({ body: draftProductStepBodyZodSchema }),
  tryCatchResponse(saveDraftProductController),
);

draftRouter[draft.publish.method](
  draft.publish.path,
  tryCatchResponse(publishDraftProductController),
);

draftRouter[draft.get.method](draft.get.path, tryCatchResponse(getDraftProductController));

/* ================== DASHBOARD ROUTES ================ */

dashboardRouter[get.dashboard.products.method](
  get.dashboard.products.path,
  tryCatchResponse(getDashboardProductsController),
);

dashboardRouter[get.dashboard.bySlug.method](
  get.dashboard.bySlug.path,
  tryCatchResponse(getDashboardProductBySlugController),
);

/* ================== PRODUCTS ROUTES ================ */

productRouter.use(draft.base, authorize(['ADMIN', 'SELLER', 'MASTER']), draftRouter);
productRouter.use(get.dashboard.base, authorize(['ADMIN', 'SELLER', 'MASTER']), dashboardRouter);

productRouter[get.bySlug.method](get.bySlug.path, tryCatchResponse(getProductBySlugController));

productRouter[get.suggestions.method](
  get.suggestions.path,
  tryCatchResponse(getProductsSuggestionsController),
);
