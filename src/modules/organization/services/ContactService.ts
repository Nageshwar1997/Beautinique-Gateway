import type {
  IListContactQueriesQuery,
  TContactQueryStatus,
  TCreateContactQueryZodSchema,
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
  public updateContactQueryStatus(ticketId: string, status: TContactQueryStatus, user: TUser) {
    const { method, url } = this.routes.updateStatus;
    return this.request({ method, url: url({ ticketId }), params: { status }, user });
  }
}

export const contactService = new ContactService();
