import { BaseProductService } from '../../../classes';
import { API_METHODS_AND_URLS } from '../../../constants';
import type { IUser } from '../../../types';

class ProductService extends BaseProductService {
  private readonly routes = API_METHODS_AND_URLS.product_service.product;

  /* ================== POST METHODS ================== */

  public saveDraftProduct({ user, data }: { data: unknown } & IUser) {
    return this.request({ ...this.routes.draft.save, data, user });
  }

  public publishDraftProduct({ user }: IUser) {
    return this.request({ ...this.routes.draft.publish, user });
  }

  /* ================== PATCH METHODS ================== */

  /* ================== DELETE METHODS ================== */

  /* ================== GET METHODS ================== */

  public getDraftProduct({ user }: IUser) {
    return this.request({ ...this.routes.draft.get, user });
  }
}

export const productService = new ProductService();
