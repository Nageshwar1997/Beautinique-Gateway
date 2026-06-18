import { checkEmptyRequest, tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import {
  getDraftProductController,
  publishDraftProductController,
  saveDraftProductController,
} from '../controllers/product.controller';

export const productRouter = Router();
const draftRouter = Router();
const { draft } = METHODS_AND_PATHS.product_service.product;

draftRouter[draft.save.method](
  draft.save.path,
  checkEmptyRequest({ body: true }),
  tryCatchResponse(saveDraftProductController),
);

draftRouter[draft.publish.method](draft.publish.path, tryCatchResponse(publishDraftProductController));

draftRouter[draft.get.method](draft.get.path, tryCatchResponse(getDraftProductController));

productRouter.use(draft.base, authorize(['ADMIN', 'SELLER', 'MASTER']), draftRouter);
