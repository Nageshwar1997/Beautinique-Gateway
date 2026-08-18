import { SERVICE_NAMES_MAP } from '@beautinique/backend-constants';

import { ApiRequest } from './ApiRequest.js';

export class BaseProductService extends ApiRequest {
  constructor() {
    super(SERVICE_NAMES_MAP.product);
  }
}

export class BaseUserService extends ApiRequest {
  constructor() {
    super(SERVICE_NAMES_MAP.user);
  }
}

export class BaseOrganizationService extends ApiRequest {
  constructor() {
    super(SERVICE_NAMES_MAP.organization);
  }
}
