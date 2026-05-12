import { ApiRequest } from '../../../classes';
import { HEADERS_KEYS } from '../../../constants';

class UserService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== GET METHODS ================== */

  public getSessionUser(userId: string) {
    return this.request({
      ...this.routes.user.session,
      headers: { [HEADERS_KEYS.userId]: userId },
    });
  }
}

export const userService = new UserService();
