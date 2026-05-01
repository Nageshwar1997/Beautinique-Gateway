import type { TLogin, TRegister, TRegisterEmail, TRegisterOtp } from '@beautinique/be-zod';
import { ApiRequest } from '../../../classes';

class AuthService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== REGISTER METHODS ================== */
  public async registerSendOtp(data: TRegisterEmail) {
    return this.request({ ...this.routes.user.register.sendOtp, data });
  }

  public async registerResendOtp(token: string) {
    return this.request({
      ...this.routes.user.register.resendOtp,
      headers: { Authorization: token },
    });
  }

  public async registerVerifyOtp({ otp, token }: TRegisterOtp & { token: string }) {
    return this.request({
      ...this.routes.user.register.verifyOtp,
      data: { otp },
      headers: { Authorization: token },
    });
  }

  public async registerAndSave({ token, ...data }: TRegister & { token: string }) {
    return this.request({
      ...this.routes.user.register.saveUser,
      data,
      headers: { Authorization: token },
    });
  }

  /* ================== LOGIN METHODS ================== */
  public async manualLogin(data: TLogin) {
    return this.request({ ...this.routes.user.login.manual, data });
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
}

export const authService = new AuthService();
