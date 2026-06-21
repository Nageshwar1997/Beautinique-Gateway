import { BaseProductService } from '../../../classes';
import { API_METHODS_AND_URLS } from '../../../constants';
import type { IUser } from '../../../types';

class ProductService extends BaseProductService {
  private readonly routes = API_METHODS_AND_URLS.product_service.product;

  /* ================== POST METHODS ================== */

  public saveDraftProduct({ user, data }: { data: unknown } & IUser) {
    return this.request({ ...this.routes.draft.save, data, user });
  }

  /* ================== PATCH METHODS ================== */

  public publishDraftProduct({ user }: IUser) {
    return this.request({ ...this.routes.draft.publish, user });
  }

  /* ================== DELETE METHODS ================== */

  /* ================== GET METHODS ================== */

  public getDraftProduct({ user }: IUser) {
    return this.request({ ...this.routes.draft.get, user });
  }

  public getDashboardProducts({ user, params }: IUser & { params?: Record<string, string> }) {
    return this.request({ ...this.routes.get.dashboard.products, user, params });
  }



  public getProductsSuggestions(params: Record<string, string>) {
    return this.request({ ...this.routes.get.suggestions, params });
  }
}

export const productService = new ProductService();
