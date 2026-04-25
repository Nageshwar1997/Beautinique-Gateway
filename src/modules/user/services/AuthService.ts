import type { TLogin, TRegister } from '@beautinique/be-zod';
import { ApiRequest } from '@/classes';

class AuthService extends ApiRequest {
  constructor() {
    super('user-service');
  }

  /* ================== REGISTER METHODS ================== */
  public async registerSendOtp(data: Pick<TRegister, 'email'>) {
    return this.request({ ...this.routes.user.register.sendOtp, data });
  }

  public async registerResendOtp({
    email,
    otpToken,
  }: Pick<TRegister, 'email'> & { otpToken: string }) {
    return this.request({
      ...this.routes.user.register.resendOtp,
      data: { email },
      headers: { Authorization: otpToken },
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

  public async handleLinkedinCallback(params: unknown) {
    return this.request({
      ...this.routes.user.login.oAuth.linkedin.callback,
      params,
    });
  }

  public async getGithubRedirectUrl() {
    return this.request(this.routes.user.login.oAuth.github.redirect);
  }

  public async handleGithubCallback() {
    return this.request({
      ...this.routes.user.login.oAuth.github.callback,
    });
  }
}

export const authService = new AuthService();
