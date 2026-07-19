import type { TCategory, TUpdateCategory } from '@beautinique/be-zod';
import type { Request, Response } from 'express';

import { getAuthUser } from '../../../utils/index.js';
import { categoryService } from '../services/index.js';

export const addCategoryController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const data = req.body as TCategory;

  const response = await categoryService.addCategory({ user, data });

  res.success(response);
};

export const updateCategoryController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const data = req.body as TUpdateCategory;
  const categoryId = req.params.categoryId as string;

  const response = await categoryService.updateCategory({ user, data, categoryId });

  res.success(response);
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const categoryId = req.params.categoryId as string;

  const response = await categoryService.deleteCategory({
    user,
    categoryId: categoryId,
  });

  res.success(response);
};

export const getCategoriesByParentLevelController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const parent = req.query.parent as string;
  const level = req.query.level as string;
  const response = await categoryService.getCategoriesByParentLevel({
    params: { parent, level },
    user,
  });

  res.success(response);
};

export const getCategoriesByHierarchyController = async (_req: Request, res: Response) => {
  const response = await categoryService.getCategoriesByHierarchy();

  res.success(response);
};
