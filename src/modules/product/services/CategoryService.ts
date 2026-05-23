import type { TCategory, TUpdateCategory } from '@beautinique/be-zod';
import { ApiRequest } from '../../../classes';
import { HEADERS_KEYS } from '../../../constants';
import type { IUser, TUser } from '../../../types';

class CategoryService extends ApiRequest {
  constructor() {
    super('product-service');
  }

  /* ================== POST METHODS ================== */

  public addCategory({ user, data }: { data: TCategory } & IUser) {
    return this.request({
      ...this.routes.product.category.add,
      data,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }

  /* ================== PATCH METHODS ================== */

  public updateCategory({
    user,
    data,
    categoryId,
  }: {
    data: TUpdateCategory;
    categoryId: string;
  } & IUser) {
    const { method, url } = this.routes.product.category.update;
    return this.request({
      method,
      url: `${url}/${categoryId}`,
      data,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }

  /* ================== DELETE METHODS ================== */

  public deleteCategory({ user, categoryId }: { categoryId: string } & IUser) {
    const { method, url } = this.routes.product.category.delete;
    return this.request({
      method,
      url: `${url}/${categoryId}`,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }

  /* ================== GET METHODS ================== */

  public getCategoriesByParentLevel({
    user,
    params,
  }: {
    params: { parent?: string; level?: string };
  } & IUser) {
    return this.request({
      ...this.routes.product.category.get.byParentLevel,
      params,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }

  public getCategoriesByHierarchy(user: TUser) {
    return this.request({
      ...this.routes.product.category.get.byHierarchy,
      headers: { [HEADERS_KEYS.userId]: user._id, [HEADERS_KEYS.userRole]: user.role },
    });
  }
}

export const categoryService = new CategoryService();
