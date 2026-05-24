import { BaseUserService } from '../../../classes';
import { API_METHODS_AND_URLS } from '../../../constants';
import type { TUser } from '../../../types';

class UserService extends BaseUserService {
  private routes = API_METHODS_AND_URLS.user_service.user;

  /* ================== GET SESSION USER ================== */

  public getSessionUser(user: TUser) {
    return this.request({ ...this.routes.session, user });
  }
}

export const userService = new UserService();
