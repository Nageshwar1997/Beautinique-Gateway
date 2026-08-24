import type {
  TAssignAdminTerritoryZodSchema,
  TUpdateAdminStatusZodSchema,
} from '@beautinique/backend-types';

import { BaseUserService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { TUser } from '../../../types/index.js';

class AdminTerritoryService extends BaseUserService {
  private routes = API_METHODS_AND_URLS.user_service.admin.territory;

  /* ================== MY ADMIN PROFILE (self) ================== */
  public getMyAdmin(user: TUser) {
    return this.request({ ...this.routes.me, user });
  }

  /* ================== ASSIGN TERRITORY (MASTER only) ================== */
  public assignAdminTerritory(user: TUser, adminId: string, data: TAssignAdminTerritoryZodSchema) {
    const { method, url } = this.routes.assign;

    return this.request({ method, url: url({ adminId }), data, user });
  }

  /* ================== UPDATE STATUS (self or MASTER) ================== */
  public updateAdminStatus(user: TUser, adminId: string, data: TUpdateAdminStatusZodSchema) {
    const { method, url } = this.routes.status;

    return this.request({ method, url: url({ adminId }), data, user });
  }

  /* ================== DEMOTE (MASTER only) ================== */
  public demoteAdmin(user: TUser, adminId: string, reassignTo?: string) {
    const { method, url } = this.routes.demote;

    return this.request({
      method,
      url: url({ adminId }),
      user,
      ...(reassignTo && { params: { reassignTo } }),
    });
  }

  /* ================== TERRITORY MAP (MASTER only) ================== */
  public getTerritoryMap(user: TUser, includeInactive?: boolean) {
    return this.request({
      ...this.routes.map,
      user,
      ...(includeInactive && { params: { includeInactive: 'true' } }),
    });
  }

  /* ================== STATE ADMINS (internal + admin UI) ================== */
  public getStateAdmins(user: TUser, state: string) {
    const { method, url } = this.routes.stateAdmins;

    return this.request({ method, url: url({ state }), user });
  }
}

export const adminTerritoryService = new AdminTerritoryService();
