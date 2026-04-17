import type { TRegister } from '@beautinique/be-zod';
import { ApiRequest } from '@/classes';
import type { AppSuccess } from '@beautinique/be-classes';

class RegisterService extends ApiRequest {
  constructor() {
    super('user');
  }
  public async sendOtp(data: Pick<TRegister, 'email'>): Promise<AppSuccess> {
    return this.request({ ...this.routes.user.register.sendOtp, data });
  }
}

export const registerService = new RegisterService();
