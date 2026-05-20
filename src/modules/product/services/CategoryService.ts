import { ApiRequest } from '../../../classes';
import { HEADERS_KEYS } from '../../../constants';
import type { IJwtPayload } from '../../../types';

class CategoryService extends ApiRequest {
  constructor() {
    super('product-service');
  }

  /* ================== POST METHODS ================== */

  public addCategory({
    _id,
    role,
    ...data
  }: {
    description?: null | string;
    level: '1' | '2' | '3';
    name: string;
    parent?: null | string;
  } & IJwtPayload) {
    return this.request({
      ...this.routes.product.category.add,
      data,
      headers: { [HEADERS_KEYS.userId]: _id, [HEADERS_KEYS.userRole]: role },
    });
  }

  /* ================== PATCH METHODS ================== */

  public updateCategory({
    user,
    data,
  }: {
    data: {
      _id: string;
      description?: null | string;
      level: '1' | '2' | '3';
      name: string;
      parent?: null | string;
    };
    user: IJwtPayload;
  }) {
    return this.request({
      ...this.routes.product.category.update,
      data,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }

  /* ================== GET METHODS ================== */

  public getCategoriesByParentLevel({
    _id,
    role,
    ...params
  }: { parent?: string; level?: string } & IJwtPayload) {
    return this.request({
      ...this.routes.product.category.get.getByParentLevel,
      params,
      headers: { [HEADERS_KEYS.userId]: _id, [HEADERS_KEYS.userRole]: role },
    });
  }
}

export const categoryService = new CategoryService();
