import type { TDraftProductStepBodyZodSchema } from '@beautinique/backend-types';
import type { Request, Response } from 'express';

import { getAuthUser } from '../../../utils/index.js';
import { productService } from '../services/index.js';

export const saveDraftProductController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const data = req.body as TDraftProductStepBodyZodSchema;

  const response = await productService.saveDraftProduct({ user, data });

  res.success(response);
};

export const publishDraftProductController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await productService.publishDraftProduct(user);

  res.success(response);
};

export const getDraftProductController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await productService.getDraftProduct(user);

  res.success(response);
};

export const getDashboardProductsController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const query = req.query as Record<string, string>;

  const response = await productService.getDashboardProducts({ user, params: query });

  res.success(response);
};

export const getProductsSuggestionsController = async (req: Request, res: Response) => {
  const query = req.query as { search?: string };

  if (!query.search?.trim()) {
    res.success({ message: 'Suggestions fetched successfully', data: [] });
    return;
  }

  const response = await productService.getProductsSuggestions(query);

  res.success(response);
};

export const getDashboardProductBySlugController = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const user = getAuthUser(req.user);

  const response = await productService.getDashboardProductBySlug(slug, user);

  res.success(response);
};

export const getProductBySlugController = async (req: Request, res: Response) => {
  const slug = req.params.slug as string;

  const response = await productService.getProductBySlug(slug);

  res.success(response);
};
