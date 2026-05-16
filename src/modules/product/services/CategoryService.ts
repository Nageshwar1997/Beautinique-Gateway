import { ApiRequest } from '../../../classes';

class CategoryService extends ApiRequest {
  constructor() {
    super('product-service');
  }

  /* ================== GET METHODS ================== */

  public getAllCategories() {
    return this.request(this.routes.product.category.get.all);
  }
}

export const categoryService = new CategoryService();
