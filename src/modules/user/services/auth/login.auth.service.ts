import { TLogin } from '@beautinique/be-zod';
import { ApiRequest } from '@/classes';

class LoginService extends ApiRequest {
  constructor() {
    super('user');
  }
  public async manualLogin(data: TLogin) {
    return this.request({ ...this.routes.user.login.manual, data });
  }

  public async getGoogleRedirectUrl() {
    return this.request(this.routes.user.login.oAuth.google.redirect);
  }

  public async handleGoogleCallback(params: any) {
    return this.request({
      ...this.routes.user.login.oAuth.google.callback,
      params,
    });
  }

  public async getLinkedinRedirectUrl() {
    return this.request(this.routes.user.login.oAuth.linkedin.redirect);
  }

  public async handleLinkedinCallback(params: any) {
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

export const loginService = new LoginService();
