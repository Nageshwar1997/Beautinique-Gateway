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

  const { message, statusCode, draft } = await productService.getDraftProduct({ user });

  res.success(statusCode, message, { draft });
};

export const getDashboardProductsController = async (req: Request, res: Response) => {
  const user = getUser(req);

  const query = req.query;

  const { message, statusCode, data } = await productService.getDashboardProducts({
    user,
    params: query as Record<string, string>,
  });

  res.success(statusCode, message, { data });
};


export const getProductsSuggestionsController = async (req: Request, res: Response) => {
  const query = req.query as { search?: string };

  if (!query.search?.trim()) {
    return res.success(200, 'Suggestions fetched successfully', { suggestions: [] });
  }

  const { message, statusCode, suggestions } = await productService.getProductsSuggestions(query);

  res.success(statusCode, message, { suggestions });
};
