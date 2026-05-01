import { ApiRequest } from "../../../classes";

class UserService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== GET METHODS ================== */

  public getSessionUser(userId: string) {
    return this.request({ ...this.routes.user.session, params: { userId } });
  }
}

export const userService = new UserService();
