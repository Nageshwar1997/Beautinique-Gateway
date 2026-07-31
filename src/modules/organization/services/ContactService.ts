import type {
  IListContactQueriesQuery,
  TContactQueryTicketIdZodSchema,
  TCreateContactQueryZodSchema,
  TUpdateContactQueryStatusZodSchema,
} from '@beautinique/backend-types';

import { BaseOrganizationService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { TUser } from '../../../types/index.js';

class ContactService extends BaseOrganizationService {
  private routes = API_METHODS_AND_URLS.organization_service.contact;

  /* ================== GET CONTACT QUERIES LIST ================== */
  public getContactQueries(user: TUser, params: IListContactQueriesQuery) {
    return this.request({ ...this.routes.list, user, params });
  }

  /* ================== CREATE CONTACT QUERY ================== */
  public createContactQuery(data: TCreateContactQueryZodSchema) {
    return this.request({ ...this.routes.create, data });
  }

  /* ================== UPDATE CONTACT QUERY STATUS ================== */
  public updateContactQueryStatus(
    params: TContactQueryTicketIdZodSchema,
    data: TUpdateContactQueryStatusZodSchema,
    user: TUser,
  ) {
    const { method, url } = this.routes.updateStatus;
    return this.request({ method, url: url(params), data, user });
  }
}

export const contactService = new ContactService();
