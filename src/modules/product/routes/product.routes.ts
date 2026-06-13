import { checkEmptyRequest, tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../constants';
import { authorize } from '../../../middlewares';
import { saveDraftProductController } from '../controllers/product.controller';

export const productRouter = Router();
const draftRouter = Router();
const { draft } = METHODS_AND_PATHS.product_service.product;

draftRouter[draft.save.method](
  draft.save.path,
  authorize(['ADMIN', 'MASTER']),
  checkEmptyRequest({ body: true }),
  tryCatchResponse(saveDraftProductController),
);

productRouter.use(draft.base, draftRouter);
