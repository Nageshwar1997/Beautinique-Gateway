import { AuthLoginClass } from './login.auth.user.service';

export class AuthClass {
  public static login() {
    return new AuthLoginClass();
  }
}
