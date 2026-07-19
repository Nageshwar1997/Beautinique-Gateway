import { ApiRequest } from './ApiRequest.js';

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
