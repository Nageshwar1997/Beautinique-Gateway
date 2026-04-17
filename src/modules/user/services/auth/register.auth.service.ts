import { TRegister } from '@beautinique/be-zod';
import { ApiRequest } from '@/classes';

class RegisterService extends ApiRequest {
  constructor() {
    super('user');
  }
  public async sendOtp(data: Pick<TRegister, 'email'>) {
    return this.request({ ...this.routes.user.login.manual, data: data });
  }
}

export const registerService = new RegisterService();
