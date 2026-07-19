import type { Request, Response } from 'express';

import { getAuthUser } from '../../../utils/index.js';
import { productService } from '../services/index.js';

export const saveDraftProductController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const { message, statusCode, draft } = await productService.saveDraftProduct({
    user,
    data: req.body,
  });

  res.success(statusCode, message, { draft });
};

export const publishDraftProductController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const { message, statusCode } = await productService.publishDraftProduct(user);

  res.success(statusCode, message);
};

export const getDraftProductController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const { message, statusCode, draft } = await productService.getDraftProduct(user);

  res.success(statusCode, message, { draft });
};

export const getDashboardProductsController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

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
    res.success(200, 'Suggestions fetched successfully', { suggestions: [] });
    return;
  }

  const { message, statusCode, suggestions } = await productService.getProductsSuggestions(query);

  res.success(statusCode, message, { suggestions });
};

export const getDashboardProductBySlugController = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const user = getAuthUser(req.user);

  const { message, statusCode, product } = await productService.getDashboardProductBySlug(
    slug,
    user,
  );

  res.success(statusCode, message, { product });
};

export const getProductBySlugController = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const { message, statusCode, product } = await productService.getProductBySlug(slug);

  res.success(statusCode, message, { product });
};
