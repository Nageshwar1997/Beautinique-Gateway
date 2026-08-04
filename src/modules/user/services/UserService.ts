import type {
  TChangePasswordZodSchema,
  TSetPasswordZodSchema,
  TUpdateUserZodSchema,
} from '@beautinique/backend-types';

import { BaseUserService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { TUser } from '../../../types/index.js';

class UserService extends BaseUserService {
  private routes = API_METHODS_AND_URLS.user_service.user;

  /* ================== GET SESSION USER ================== */

  public getSessionUser(user: TUser) {
    return this.request({ ...this.routes.session, user });
  }

  /* ================== UPDATE USER ================== */
  public updateUser(user: TUser, data: TUpdateUserZodSchema) {
    return this.request({ ...this.routes.update, user, data });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(user: TUser, data: TChangePasswordZodSchema) {
    return this.request({ ...this.routes.password.change, data, user });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(user: TUser, data: TSetPasswordZodSchema) {
    return this.request({ ...this.routes.password.set, data, user });
  }
}

export const userService = new UserService();
