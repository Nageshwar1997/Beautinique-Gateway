import type {
  TDraftSellerStepBodyZodSchema,
  TUpdateSellerApprovalStatusZodSchema,
} from '@beautinique/backend-types';
import { getUser } from '@beautinique/backend-utils';
import type { Request, Response } from 'express';

import { sellerService } from '../services/index.js';

export const saveDraftSellerController = async (req: Request, res: Response) => {
  const user = getUser(req.user);
  const body = req.body as TDraftSellerStepBodyZodSchema;

  const response = await sellerService.saveDraftSeller(user, body);

  res.success(response);
};

export const getDraftSellerController = async (req: Request, res: Response) => {
  const user = getUser(req.user);

  const response = await sellerService.getDraftSeller(user);

  res.success(response);
};
export const createSellerController = async (req: Request, res: Response) => {
  const user = getUser(req.user);

  const response = await sellerService.createSeller(user);

  res.success(response);
};

export const updateSellerApprovalStatusController = async (req: Request, res: Response) => {
  const admin = getUser(req.user);
  const { sellerId } = req.params as { sellerId: string };
  const body = req.body as TUpdateSellerApprovalStatusZodSchema;

  const response = await sellerService.updateSellerApprovalStatus(admin, sellerId, body);

  res.success(response);
};

export const getSellerQueueController = async (req: Request, res: Response) => {
  const user = getUser(req.user);
  const query = req.query as Record<string, string>;

  const response = await sellerService.getSellerQueue(user, query);

  res.success(response);
};
