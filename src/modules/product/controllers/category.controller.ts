import type { Request, Response } from 'express';
import { getUser } from '../../../utils';
import { categoryService } from '../services';

export const getCategoriesByParentLevelController = async (req: Request, res: Response) => {
  const user = getUser(req);
  const parentId = req.query.parentId?.toString();
  const level = req.query.level?.toString();
  const { message, statusCode, categories } = await categoryService.getCategoriesByParentLevel({
    parentId,
    level,
    ...user,
  });

  res.success(statusCode, message, { categories });
};
