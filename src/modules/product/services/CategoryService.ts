import { ApiRequest } from '../../../classes';
import { HEADERS_KEYS } from '../../../constants';
import type { IJwtPayload } from '../../../types';

class CategoryService extends ApiRequest {
  constructor() {
    super('product-service');
  }

  /* ================== GET METHODS ================== */

  public getCategoriesByParentLevel({
    _id,
    role,
    ...params
  }: { parentId?: string; level?: string } & IJwtPayload) {
    return this.request({
      ...this.routes.product.category.get.getByParentLevel,
      params,
      headers: { [HEADERS_KEYS.userId]: _id, [HEADERS_KEYS.userRole]: role },
    });
  }
}

export const categoryService = new CategoryService();
