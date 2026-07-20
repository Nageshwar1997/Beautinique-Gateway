import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import { draftProductStepBodyZodSchema, validateZod } from '@beautinique/backend-zod';
import { USER_ROLE_MAP } from '@beautinique/shared-constants';
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

productRouter.use(
  draft.base,
  authorize([USER_ROLE_MAP.ADMIN, USER_ROLE_MAP.MASTER, USER_ROLE_MAP.SELLER]),
  draftRouter,
);
productRouter.use(
  get.dashboard.base,
  authorize([USER_ROLE_MAP.ADMIN, USER_ROLE_MAP.MASTER, USER_ROLE_MAP.SELLER]),
  dashboardRouter,
);

productRouter[get.bySlug.method](get.bySlug.path, tryCatchResponse(getProductBySlugController));

productRouter[get.suggestions.method](
  get.suggestions.path,
  tryCatchResponse(getProductsSuggestionsController),
);
