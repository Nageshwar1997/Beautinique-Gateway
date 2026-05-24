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
    return this.request({ ...this.router.add, data, headers: createHeaders({ user }) });
  }

  /* ================== PATCH METHODS ================== */

  public updateCategory({
    user,
    data,
    categoryId,
  }: IUser & { data: TUpdateCategory; categoryId: string }) {
    const { method, url } = this.router.update;
    return this.request({
      method,
      url: url({ categoryId }),
      data,
      headers: createHeaders({ user }),
    });
  }

  /* ================== DELETE METHODS ================== */

  public deleteCategory({ user, categoryId }: { categoryId: string } & IUser) {
    const { method, url } = this.router.delete;
    return this.request({ method, url: url({ categoryId }), headers: createHeaders({ user }) });
  }

  /* ================== GET METHODS ================== */

  public getCategoriesByParentLevel(data: { params: { parent?: string; level?: string } } & IUser) {
    return this.request({
      ...this.router.get.byParentLevel,
      params: data.params,
      headers: createHeaders({ user: data.user }),
    });
  }

  public getCategoriesByHierarchy(user: TUser) {
    return this.request({ ...this.router.get.byHierarchy, headers: createHeaders({ user }) });
  }
}

export const categoryService = new CategoryService();
