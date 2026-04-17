import { ApiRequest } from '@/classes/ApiRequest';
import { envs } from '@/envs';
import { AuthClass } from './auth';

export class BaseUserService extends ApiRequest {
  constructor() {
    super(`${envs.service.user}/api/v1`);
  }
}

export class UserService {
  public static auth() {
    return new AuthClass();
  }
}
