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
    const { method, getUrl } = this.router.auth.register.sendOtp;

    return this.request({ method, url: getUrl(), data });
  }

  public async registerResendOtp(token: string) {
    const { method, getUrl } = this.router.auth.register.resendOtp;

    return this.request({ method, url: getUrl(), headers: createHeaders({ token }) });
  }

  public async registerVerifyOtp({ token, ...data }: TOtp & { token: string }) {
    const { method, getUrl } = this.router.auth.register.verifyOtp;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ token }) });
  }

  public async registerAndSave({ token, ...data }: TRegister & { token: string }) {
    const { method, getUrl } = this.router.auth.register.saveUser;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ token }) });
  }

  /* ================== LOGIN METHODS ================== */
  public async manualLogin(data: TLogin, loginRole?: TRole) {
    const { method, getUrl } = this.router.auth.login.manual;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ loginRole }) });
  }

  public async getGoogleRedirectUrl() {
    const { method, getUrl } = this.router.auth.login.oauth.google.redirect;

    return this.request({ method, url: getUrl() });
  }

  public async handleGoogleCallback(code: string) {
    const { method, getUrl } = this.router.auth.login.oauth.google.callback;

    return this.request({ method, url: getUrl(), params: { code } });
  }

  public async getLinkedinRedirectUrl() {
    const { method, getUrl } = this.router.auth.login.oauth.linkedin.redirect;

    return this.request({ method, url: getUrl() });
  }

  public async handleLinkedinCallback(code: string) {
    const { method, getUrl } = this.router.auth.login.oauth.linkedin.callback;

    return this.request({ method, url: getUrl(), params: { code } });
  }

  public async getGithubRedirectUrl() {
    const { method, getUrl } = this.router.auth.login.oauth.github.redirect;

    return this.request({ method, url: getUrl() });
  }

  public async handleGithubCallback(code: string) {
    const { method, getUrl } = this.router.auth.login.oauth.github.callback;

    return this.request({ method, url: getUrl(), params: { code } });
  }

  /* ================== FORGOT PASSWORD METHODS ================== */
  public async forgotPasswordSendOtp(data: TEmail) {
    const { method, getUrl } = this.router.auth.password.forgot.sendOtp;

    return this.request({ method, url: getUrl(), data });
  }

  public async forgotPasswordResendOtp(token: string) {
    const { method, getUrl } = this.router.auth.password.forgot.resendOtp;

    return this.request({ method, url: getUrl(), headers: createHeaders({ token }) });
  }

  public async forgotPasswordVerifyOtp({ token, ...data }: TOtp & { token: string }) {
    const { method, getUrl } = this.router.auth.password.forgot.verifyOtp;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ token }) });
  }

  public async forgotPasswordSave({ token, ...data }: TPasswords & { token: string }) {
    const { method, getUrl } = this.router.auth.password.forgot.save;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ token }) });
  }

  /* ================== CHANGE PASSWORD METHODS ================== */
  public async changePassword(user: TUser, data: TChangePassword) {
    const { method, getUrl } = this.router.auth.password.change;

    return this.request({
      method,
      url: getUrl(),
      data,
      headers: createHeaders({ user }),
    });
  }

  /* ================== SET PASSWORD METHODS ================== */
  public async setPassword(user: TUser, data: TSetPassword) {
    const { method, getUrl } = this.router.auth.password.set;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ user }) });
  }

  /* ================== LOGOUT METHODS ================== */
  public async logout(user: TUser) {
    const { method, getUrl } = this.router.auth.logout;

    return this.request({ method, url: getUrl(), headers: createHeaders({ user }) });
  }

  /* ================== GET SESSION USER ================== */

  public getSessionUser(user: TUser) {
    const { method, getUrl } = this.router.user.session;

    return this.request({ method, url: getUrl(), headers: createHeaders({ user }) });
  }
}

export const userService = new UserService();
