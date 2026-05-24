import type { TCategory, TUpdateCategory } from '@beautinique/be-zod';
import { ApiRequest } from '../../../classes';
import type { IUser, TUser } from '../../../types';
import { createHeaders } from '../../../utils';

class CategoryService extends ApiRequest {
  private router = this.routes.product_service.category;
  constructor() {
    super('product-service');
  }

  /* ================== POST METHODS ================== */

  public addCategory({ user, data }: { data: TCategory } & IUser) {
    const { method, getUrl } = this.router.add;

    return this.request({ method, url: getUrl(), data, headers: createHeaders({ user }) });
  }

  /* ================== PATCH METHODS ================== */

  public updateCategory({
    user,
    data,
    categoryId,
  }: IUser & { data: TUpdateCategory; categoryId: string }) {
    const { method, getUrl } = this.router.update;
    return this.request({
      method,
      url: getUrl({ categoryId }),
      data,
      headers: createHeaders({ user }),
    });
  }

  /* ================== DELETE METHODS ================== */

  public deleteCategory({ user, categoryId }: { categoryId: string } & IUser) {
    const { method, getUrl } = this.router.delete;
    return this.request({ method, url: getUrl({ categoryId }), headers: createHeaders({ user }) });
  }

  /* ================== GET METHODS ================== */

  public getCategoriesByParentLevel(data: { params: { parent?: string; level?: string } } & IUser) {
    const { method, getUrl } = this.router.get.byParentLevel;

    return this.request({
      method,
      url: getUrl(),
      params: data.params,
      headers: createHeaders({ user: data.user }),
    });
  }

  public getCategoriesByHierarchy(user: TUser) {
    const { getUrl, method } = this.router.get.byHierarchy;
    return this.request({ method, url: getUrl(), headers: createHeaders({ user }) });
  }
}

export const categoryService = new CategoryService();
