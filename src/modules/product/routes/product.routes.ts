import { checkEmptyRequest, tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import {
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

draftRouter[draft.save.method](draft.save.path, tryCatchResponse(publishDraftProductController));

productRouter.use(draft.base, authorize(['ADMIN', 'SELLER', 'MASTER']), draftRouter);
