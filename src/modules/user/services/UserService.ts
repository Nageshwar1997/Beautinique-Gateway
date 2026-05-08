import { ApiRequest } from '../../../classes';

class UserService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== GET METHODS ================== */

  public getSessionUser(userId: string) {
    return this.request({ ...this.routes.user.session, headers: { 'X-User-Id': userId } });
  }
}

export const userService = new UserService();
