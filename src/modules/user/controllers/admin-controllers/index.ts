import type {
  TAssignAdminTerritoryZodSchema,
  TUpdateAdminStatusZodSchema,
} from '@beautinique/backend-types';
import type { Request, Response } from 'express';

import { getAuthUser } from '../../../../utils/index.js';
import { adminTerritoryService } from '../../services/index.js';

/* ================================ MY ADMIN PROFILE (self) ================================ */

export const getMyAdminController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await adminTerritoryService.getMyAdmin(user);

  res.success(response);
};

/* ================================ ASSIGN TERRITORY (MASTER only) ================================ */

export const assignAdminTerritoryController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const { adminId } = req.params as { adminId: string };
  const body = req.body as TAssignAdminTerritoryZodSchema;

  const response = await adminTerritoryService.assignAdminTerritory(user, adminId, body);

  res.success(response);
};

/* ================================ UPDATE STATUS (self or MASTER) ================================ */

export const updateAdminStatusController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const { adminId } = req.params as { adminId: string };
  const body = req.body as TUpdateAdminStatusZodSchema;

  const response = await adminTerritoryService.updateAdminStatus(user, adminId, body);

  res.success(response);
};

/* ================================ TERRITORY MAP (MASTER only) ================================ */

export const getTerritoryMapController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await adminTerritoryService.getTerritoryMap(user);

  res.success(response);
};

/* ================================ STATE ADMINS (internal + admin UI) ================================ */

export const getStateAdminsController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const { state } = req.params as { state: string };

  const response = await adminTerritoryService.getStateAdmins(user, state);

  res.success(response);
};
