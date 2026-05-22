import type { Request, Response } from 'express';
import { getUser } from '../../../utils';
import { categoryService } from '../services';

export const addCategoryController = async (req: Request, res: Response) => {
  const user = getUser(req);
  const data = (req.body ?? {}) as {
    description?: null | string;
    level: '1' | '2' | '3';
    name: string;
    parent?: null | string;
  };

  const { message, statusCode } = await categoryService.addCategory({ ...user, ...data });

  res.success(statusCode, message);
};

export const updateCategoryController = async (req: Request, res: Response) => {
  const user = getUser(req);
  const data = (req.body ?? {}) as {
    _id: string;
    description?: null | string;
    level: '1' | '2' | '3';
    name: string;
    parent?: null | string;
  };
  const categoryId = req.params.categoryId?.toString();

  const { message, statusCode } = await categoryService.updateCategory({ user, data, categoryId });

  res.success(statusCode, message);
};

export const deleteCategoryController = async (req: Request, res: Response) => {
  const user = getUser(req);
  const { categoryId } = req.params ?? {};

  const { message, statusCode } = await categoryService.deleteCategory({
    user,
    categoryId: categoryId.toString(),
  });

  res.success(statusCode, message);
};

export const getCategoriesByParentLevelController = async (req: Request, res: Response) => {
  const user = getUser(req);
  const parent = req.query.parent?.toString();
  const level = req.query.level?.toString();
  const { message, statusCode, categories } = await categoryService.getCategoriesByParentLevel({
    parent,
    level,
    ...user,
  });

  res.success(statusCode, message, { categories });
};
