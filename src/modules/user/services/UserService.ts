import { ApiRequest } from '@/classes';

class UserService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== GET METHODS ================== */

  public getUserDetails(userId: string) {
    return this.request({ ...this.routes.user.me, params: { userId } });
  }
}

export const userService = new UserService();
