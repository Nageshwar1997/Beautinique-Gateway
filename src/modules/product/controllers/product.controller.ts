import type { Request, Response } from 'express';
import { getUser } from '../../../utils';
import { productService } from '../services/ProductService';

export const saveDraftProductController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const { message, statusCode, draft } = await productService.saveDraftProduct({
    user,
    data: req.body,
  });

  res.success(statusCode, message, { draft });
};

export const publishDraftProductController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const { message, statusCode } = await productService.publishDraftProduct({ user });

  res.success(statusCode, message);
};

export const getDraftProductController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const { message, statusCode } = await productService.getDraftProduct({ user });

  res.success(statusCode, message);
};
