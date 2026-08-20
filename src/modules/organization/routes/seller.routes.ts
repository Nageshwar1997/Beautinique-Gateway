import { USER_ROLE_MAP } from '@beautinique/backend-constants';
import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import {
  draftSellerStepBodyZodSchema,
  updateSellerApprovalStatusZodSchema,
  validateZod,
} from '@beautinique/backend-zod';
import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import {
  createSellerController,
  getDraftSellerController,
  getMySellerController,
  getSellerQueueController,
  saveDraftSellerController,
  updateSellerApprovalStatusController,
} from '../controllers/index.js';

export const sellerRouter = Router();
const draftRouter = Router();

const { draft, me, queue, updateApprovalStatus } = METHODS_AND_PATHS.organization_service.seller;

/* ================== DRAFT ROUTES (self-service onboarding wizard) ================== */

draftRouter[draft.save.method](
  draft.save.path,
  checkEmptyRequest({ body: true }),
  validateZod({ body: draftSellerStepBodyZodSchema }),
  tryCatchResponse(saveDraftSellerController),
);

draftRouter[draft.get.method](draft.get.path, tryCatchResponse(getDraftSellerController));

draftRouter[draft.submit.method](draft.submit.path, tryCatchResponse(createSellerController));

sellerRouter.use(draft.base, authenticate, draftRouter);

/* ================== SELF (any logged-in user - their own application) ================== */

sellerRouter[me.method](me.path, authenticate, tryCatchResponse(getMySellerController));

/* ================== ADMIN REVIEW ================== */

sellerRouter[updateApprovalStatus.method](
  updateApprovalStatus.path,
  authorize([USER_ROLE_MAP.ADMIN, USER_ROLE_MAP.SUPER_ADMIN, USER_ROLE_MAP.MASTER]),
  checkEmptyRequest({ body: true, params: true }),
  validateZod({ body: updateSellerApprovalStatusZodSchema }),
  tryCatchResponse(updateSellerApprovalStatusController),
);

sellerRouter[queue.method](
  queue.path,
  authorize([USER_ROLE_MAP.ADMIN, USER_ROLE_MAP.SUPER_ADMIN, USER_ROLE_MAP.MASTER]),
  tryCatchResponse(getSellerQueueController),
);
