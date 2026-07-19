import type { TCategoryUpdateZodSchema, TCategoryZodSchema } from '@beautinique/backend-types';

import { BaseProductService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { IUser } from '../../../types/index.js';

class CategoryService extends BaseProductService {
  private readonly routes = API_METHODS_AND_URLS.product_service.category;

  /* ================== POST METHODS ================== */

  public addCategory({ user, data }: { data: TCategoryZodSchema } & IUser) {
    return this.request({ ...this.routes.add, data, user });
  }

  /* ================== PATCH METHODS ================== */

  public updateCategory({
    user,
    data,
    categoryId,
  }: IUser & { data: TCategoryUpdateZodSchema; categoryId: string }) {
    const { method, url } = this.routes.update;
    return this.request({ method, url: url({ categoryId }), data, user });
  }

  /* ================== DELETE METHODS ================== */

  public deleteCategory({ user, categoryId }: { categoryId: string } & IUser) {
    const { method, url } = this.routes.delete;
    return this.request({ method, url: url({ categoryId }), user });
  }

  /* ================== GET METHODS ================== */

  public getCategoriesByParentLevel(data: { params: { parent?: string; level?: string } } & IUser) {
    return this.request({ ...this.routes.get.byParentLevel, params: data.params, user: data.user });
  }

  public getCategoriesByHierarchy() {
    return this.request(this.routes.get.byHierarchy);
  }
}

export const categoryService = new CategoryService();
