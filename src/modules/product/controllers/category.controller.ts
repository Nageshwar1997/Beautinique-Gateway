import type { Request, Response } from 'express';
import { categoryService } from '../services';

export const getAllCategoriesController = async (_req: Request, res: Response) => {
  const { message, statusCode, categories } = await categoryService.getAllCategories();

  res.success(statusCode, message, { categories });
};
