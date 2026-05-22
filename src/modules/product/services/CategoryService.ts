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
    categoryId,
  }: {
    data: {
      description?: null | string;
      level: '1' | '2' | '3';
      name: string;
      parent?: null | string;
    };
    categoryId: string;
    user: IJwtPayload;
  }) {
    const { method, url } = this.routes.product.category.update;
    return this.request({
      method,
      url: `${url}/${categoryId}`,
      data,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }

  /* ================== DELETE METHODS ================== */

  public deleteCategory({ user, categoryId }: { categoryId: string; user: IJwtPayload }) {
    const { method, url } = this.routes.product.category.delete;
    return this.request({
      method,
      url: `${url}/${categoryId}`,
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
