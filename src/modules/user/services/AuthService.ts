import type { TRole } from '@beautinique/be-constants';
import type {
  TChangePassword,
  TEmail,
  TLogin,
  TOtp,
  TPasswords,
  TRegister,
  TSetPassword,
} from '@beautinique/be-zod';
import { ApiRequest } from '../../../classes';
import { HEADERS_KEYS } from '../../../constants';

class AuthService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== REGISTER METHODS ================== */
  public async registerSendOtp(data: TEmail) {
    return this.request({ ...this.routes.user.register.sendOtp, data });
  }

  public async registerResendOtp(token: string) {
    return this.request({
      ...this.routes.user.register.resendOtp,
      headers: { [HEADERS_KEYS.authorization]: token },
    });
  }

  public async registerVerifyOtp({ otp, token }: TOtp & { token: string }) {
    return this.request({
      ...this.routes.user.register.verifyOtp,
      data: { otp },
      headers: { [HEADERS_KEYS.authorization]: token },
    });
  }

  public async registerAndSave({ token, ...data }: TRegister & { token: string }) {
    return this.request({
      ...this.routes.user.register.saveUser,
      data,
      headers: { [HEADERS_KEYS.authorization]: token },
    });
  }

  /* ================== LOGIN METHODS ================== */
  public async manualLogin(data: TLogin, role?: TRole) {

    return this.request({
      ...this.routes.user.login.manual, data, headers: {
        [HEADERS_KEYS.loginRole]: role,
    } });
  }

  public async getGoogleRedirectUrl() {
    return this.request(this.routes.user.login.oAuth.google.redirect);
  }

  public async handleGoogleCallback(code: string) {
    return this.request({
      ...this.routes.user.login.oAuth.google.callback,
      params: { code },
    });
  }

  public async getLinkedinRedirectUrl() {
    return this.request(this.routes.user.login.oAuth.linkedin.redirect);
  }

  public async handleLinkedinCallback(code: string) {
    return this.request({
      ...this.routes.user.login.oAuth.linkedin.callback,
      params: { code },
    });
  }

  public async getGithubRedirectUrl() {
    return this.request(this.routes.user.login.oAuth.github.redirect);
  }

  public async handleGithubCallback(code: string) {
    return this.request({
      ...this.routes.user.login.oAuth.github.callback,
      params: { code },
    });
  }

  /* ================== FORGOT PASSWORD METHODS ================== */
  public async forgotPasswordSendOtp(data: TEmail) {
    return this.request({ ...this.routes.user.password.forgot.sendOtp, data });
  }

  public async forgotPasswordResendOtp(token: string) {
    return this.request({
      ...this.routes.user.password.forgot.resendOtp,
      headers: { [HEADERS_KEYS.authorization]: token },
    });
  }

  public async forgotPasswordVerifyOtp({ otp, token }: TOtp & { token: string }) {
    return this.request({
      ...this.routes.user.password.forgot.verifyOtp,
      data: { otp },
      headers: { [HEADERS_KEYS.authorization]: token },
    });
  }

  public async forgotPasswordSave({ token, ...data }: TPasswords & { token: string }) {
    return this.request({
      ...this.routes.user.password.forgot.save,
      data,
      headers: { [HEADERS_KEYS.authorization]: token },
    });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(userId: string, data: TChangePassword) {
    return this.request({
      ...this.routes.user.password.change,
      data,
      headers: { [HEADERS_KEYS.userId]: userId },
    });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(userId: string, data: TSetPassword) {
    return this.request({
      ...this.routes.user.password.set,
      data,
      headers: { [HEADERS_KEYS.userId]: userId },
    });
  }

  /* ================== LOGOUT METHODS ================== */
  public async logout(userId: string) {
    return this.request({ ...this.routes.user.logout, headers: { [HEADERS_KEYS.userId]: userId } });
  }
}

export const authService = new AuthService();
