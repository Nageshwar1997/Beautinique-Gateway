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

import { BaseUserService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { TUser } from '../../../types/index.js';

class AuthService extends BaseUserService {
  private routes = API_METHODS_AND_URLS.user_service.auth;

  /* ================== REGISTER METHODS ================== */
  public async registerSendOtp(data: TEmail) {
    return this.request({ ...this.routes.register.sendOtp, data });
  }

  public async registerResendOtp(token: string) {
    return this.request({ ...this.routes.register.resendOtp, token });
  }

  public async registerVerifyOtp({ token, ...data }: TOtp & { token: string }) {
    return this.request({ ...this.routes.register.verifyOtp, data, token });
  }

  public async registerAndSave({ token, ...data }: TRegister & { token: string }) {
    return this.request<TUser>({ ...this.routes.register.saveUser, data, token });
  }

  /* ================== LOGIN METHODS ================== */
  public async manualLogin(data: TLogin, loginRole?: TRole) {
    return this.request<TUser>({ ...this.routes.login.manual, data, loginRole });
  }

  public async getGoogleRedirectUrl() {
    return this.request<string>(this.routes.login.oauth.google.redirect);
  }

  public async handleGoogleCallback(code: string) {
    return this.request<TUser>({ ...this.routes.login.oauth.google.callback, params: { code } });
  }

  public async getLinkedinRedirectUrl() {
    return this.request<string>(this.routes.login.oauth.linkedin.redirect);
  }

  public async handleLinkedinCallback(code: string) {
    return this.request<TUser>({ ...this.routes.login.oauth.linkedin.callback, params: { code } });
  }

  public async getGithubRedirectUrl() {
    return this.request<string>(this.routes.login.oauth.github.redirect);
  }

  public async handleGithubCallback(code: string) {
    return this.request<TUser>({ ...this.routes.login.oauth.github.callback, params: { code } });
  }

  /* ================== FORGOT PASSWORD METHODS ================== */
  public async forgotPasswordSendOtp(data: TEmail) {
    return this.request({ ...this.routes.password.forgot.sendOtp, data });
  }

  public async forgotPasswordResendOtp(token: string) {
    return this.request({ ...this.routes.password.forgot.resendOtp, token });
  }

  public async forgotPasswordVerifyOtp({ token, ...data }: TOtp & { token: string }) {
    return this.request({ ...this.routes.password.forgot.verifyOtp, data, token });
  }

  public async forgotPasswordSave({ token, ...data }: TPasswords & { token: string }) {
    return this.request<TUser>({ ...this.routes.password.forgot.save, data, token });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(user: TUser, data: TChangePassword) {
    return this.request({ ...this.routes.password.change, data, user });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(user: TUser, data: TSetPassword) {
    return this.request({ ...this.routes.password.set, data, user });
  }

  /* ================== LOGOUT METHODS ================== */
  public async logout(user: TUser) {
    return this.request({ ...this.routes.logout, user });
  }
}

export const authService = new AuthService();
