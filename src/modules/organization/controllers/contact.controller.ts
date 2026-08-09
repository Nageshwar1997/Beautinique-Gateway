import type {
  IListContactQueriesQuery,
  TContactQueryStatus,
  TCreateContactQueryZodSchema,
} from '@beautinique/backend-types';
import { getUser } from '@beautinique/backend-utils';
import type { Request, Response } from 'express';

import { contactService } from '../services/index.js';

export const createContactQueryController = async (req: Request, res: Response) => {
  const body = req.body as TCreateContactQueryZodSchema;
  const response = await contactService.createContactQuery(body);

  res.success(response);
};

export const getContactQueriesController = async (req: Request, res: Response) => {
  const queryParams = req.query as IListContactQueriesQuery;
  const user = getUser(req.user);

  const response = await contactService.getContactQueries(user, queryParams);

  res.success(response);
};

export const updateContactQueryStatusController = async (req: Request, res: Response) => {
  const { ticketId } = req.params as { ticketId: string };
  const { status } = req.query as { status: TContactQueryStatus };

  const user = getUser(req.user);

  const response = await contactService.updateContactQueryStatus(ticketId, status, user);

  res.success(response);
};
