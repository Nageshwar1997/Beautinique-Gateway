import type {
  TChangePasswordZodSchema,
  TEmailZodSchema,
  TLoginZodSchema,
  TOtpZodSchema,
  TPasswordsZodSchema,
  TRegisterZodSchema,
  TSetPasswordZodSchema,
  TUserRole,
} from '@beautinique/backend-types';

import { BaseUserService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { TUser } from '../../../types/index.js';

class AuthService extends BaseUserService {
  private routes = API_METHODS_AND_URLS.user_service.auth;

  /* ================== REGISTER METHODS ================== */
  public async registerSendOtp(data: TEmailZodSchema) {
    return this.request({ ...this.routes.register.sendOtp, data });
  }

  public async registerResendOtp(token: string) {
    return this.request({ ...this.routes.register.resendOtp, token });
  }

  public async registerVerifyOtp({ token, ...data }: TOtpZodSchema & { token: string }) {
    return this.request({ ...this.routes.register.verifyOtp, data, token });
  }

  public async registerAndSave({ token, ...data }: TRegisterZodSchema & { token: string }) {
    return this.request<TUser>({ ...this.routes.register.saveUser, data, token });
  }

  /* ================== LOGIN METHODS ================== */
  public async manualLogin(data: TLoginZodSchema, loginRole?: TUserRole) {
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
  public async forgotPasswordSendOtp(data: TEmailZodSchema) {
    return this.request({ ...this.routes.password.forgot.sendOtp, data });
  }

  public async forgotPasswordResendOtp(token: string) {
    return this.request({ ...this.routes.password.forgot.resendOtp, token });
  }

  public async forgotPasswordVerifyOtp({ token, ...data }: TOtpZodSchema & { token: string }) {
    return this.request({ ...this.routes.password.forgot.verifyOtp, data, token });
  }

  public async forgotPasswordSave({ token, ...data }: TPasswordsZodSchema & { token: string }) {
    return this.request<TUser>({ ...this.routes.password.forgot.save, data, token });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(user: TUser, data: TChangePasswordZodSchema) {
    return this.request({ ...this.routes.password.change, data, user });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(user: TUser, data: TSetPasswordZodSchema) {
    return this.request({ ...this.routes.password.set, data, user });
  }

  /* ================== LOGOUT METHODS ================== */
  public async logout(user: TUser) {
    return this.request({ ...this.routes.logout, user });
  }
}

export const authService = new AuthService();
