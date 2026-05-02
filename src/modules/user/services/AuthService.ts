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
      headers: { Authorization: token },
    });
  }

  public async registerVerifyOtp({ otp, token }: TOtp & { token: string }) {
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

  /* ================== FORGOT PASSWORD METHODS ================== */
  public async forgotPasswordSendOtp(data: TEmail) {
    return this.request({ ...this.routes.user.password.forgot.sendOtp, data });
  }

  public async forgotPasswordResendOtp(token: string) {
    return this.request({
      ...this.routes.user.password.forgot.resendOtp,
      headers: { Authorization: token },
    });
  }

  public async forgotPasswordVerifyOtp({ otp, token }: TOtp & { token: string }) {
    return this.request({
      ...this.routes.user.password.forgot.verifyOtp,
      data: { otp },
      headers: { Authorization: token },
    });
  }

  public async forgotPasswordSave({ token, ...data }: TPasswords & { token: string }) {
    return this.request({
      ...this.routes.user.password.forgot.save,
      data,
      headers: { Authorization: token },
    });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(data: TChangePassword) {
    return this.request({ ...this.routes.user.password.change, data });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(data: TSetPassword) {
    return this.request({ ...this.routes.user.password.set, data });
  }
}

export const authService = new AuthService();
