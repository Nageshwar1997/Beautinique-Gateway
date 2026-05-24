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
import type { TUser } from '../../../types';
import { createHeaders } from '../../../utils';

class UserService extends ApiRequest {
  private router = this.routes.user_service;
  constructor() {
    super('user-service');
  }

  /* ================== REGISTER METHODS ================== */
  public async registerSendOtp(data: TEmail) {
    return this.request({ ...this.router.auth.register.sendOtp, data });
  }

  public async registerResendOtp(token: string) {
    return this.request({
      ...this.router.auth.register.resendOtp,
      headers: createHeaders({ token }),
    });
  }

  public async registerVerifyOtp({ token, ...data }: TOtp & { token: string }) {
    return this.request({
      ...this.router.auth.register.verifyOtp,
      data,
      headers: createHeaders({ token }),
    });
  }

  public async registerAndSave({ token, ...data }: TRegister & { token: string }) {
    return this.request({
      ...this.router.auth.register.saveUser,
      data,
      headers: createHeaders({ token }),
    });
  }

  /* ================== LOGIN METHODS ================== */
  public async manualLogin(data: TLogin, loginRole?: TRole) {
    return this.request({
      ...this.router.auth.login.manual,
      data,
      headers: createHeaders({ loginRole }),
    });
  }

  public async getGoogleRedirectUrl() {
    return this.request(this.router.auth.login.oauth.google.redirect);
  }

  public async handleGoogleCallback(code: string) {
    return this.request({ ...this.router.auth.login.oauth.google.callback, params: { code } });
  }

  public async getLinkedinRedirectUrl() {
    return this.request(this.router.auth.login.oauth.linkedin.redirect);
  }

  public async handleLinkedinCallback(code: string) {
    return this.request({ ...this.router.auth.login.oauth.linkedin.callback, params: { code } });
  }

  public async getGithubRedirectUrl() {
    return this.request(this.router.auth.login.oauth.github.redirect);
  }

  public async handleGithubCallback(code: string) {
    return this.request({ ...this.router.auth.login.oauth.github.callback, params: { code } });
  }

  /* ================== FORGOT PASSWORD METHODS ================== */
  public async forgotPasswordSendOtp(data: TEmail) {
    return this.request({ ...this.router.auth.password.forgot.sendOtp, data });
  }

  public async forgotPasswordResendOtp(token: string) {
    return this.request({
      ...this.router.auth.password.forgot.resendOtp,
      headers: createHeaders({ token }),
    });
  }

  public async forgotPasswordVerifyOtp({ token, ...data }: TOtp & { token: string }) {
    return this.request({
      ...this.router.auth.password.forgot.verifyOtp,
      data,
      headers: createHeaders({ token }),
    });
  }

  public async forgotPasswordSave({ token, ...data }: TPasswords & { token: string }) {
    return this.request({
      ...this.router.auth.password.forgot.save,
      data,
      headers: createHeaders({ token }),
    });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(user: TUser, data: TChangePassword) {
    return this.request({
      ...this.router.auth.password.change,
      data,
      headers: createHeaders({ user }),
    });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(user: TUser, data: TSetPassword) {
    return this.request({
      ...this.router.auth.password.set,
      data,
      headers: createHeaders({ user }),
    });
  }

  /* ================== LOGOUT METHODS ================== */
  public async logout(user: TUser) {
    return this.request({ ...this.router.auth.logout, headers: createHeaders({ user }) });
  }

  /* ================== GET SESSION USER ================== */

  public getSessionUser(user: TUser) {
    return this.request({ ...this.router.user.session, headers: createHeaders({ user }) });
  }
}

export const userService = new UserService();
