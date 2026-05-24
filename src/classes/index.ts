import { ApiRequest } from './ApiRequest';

export * from './ApiRequest';

export class BaseProductService extends ApiRequest {
  constructor() {
    super('product-service');
  }
}

export class BaseUserService extends ApiRequest {
  constructor() {
    super('user-service');
  }
}
