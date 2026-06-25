import { BaseProductService } from '../../../classes';
import { API_METHODS_AND_URLS } from '../../../constants';
import type { IUser, TUser } from '../../../types';

class ProductService extends BaseProductService {
  private readonly routes = API_METHODS_AND_URLS.product_service.product;

  /* ================== POST METHODS ================== */

  public saveDraftProduct({ user, data }: { data: unknown } & IUser) {
    return this.request({ ...this.routes.draft.save, data, user });
  }

  /* ================== PATCH METHODS ================== */

  public publishDraftProduct(user: TUser) {
    return this.request({ ...this.routes.draft.publish, user });
  }

  /* ================== DELETE METHODS ================== */

  /* ================== GET METHODS ================== */

  public getDraftProduct(user: TUser) {
    return this.request({ ...this.routes.draft.get, user });
  }

  public getDashboardProducts({ user, params }: IUser & { params?: Record<string, string> }) {
    return this.request({ ...this.routes.get.dashboard.products, user, params });
  }

  public getDashboardProductBySlug(slug: string, user: TUser) {
    const { method, url } = this.routes.get.dashboard.bySlug;
    return this.request({ method, url: url({ slug }), user });
  }

  public getProductBySlug(slug: string) {
    const { method, url } = this.routes.get.bySlug;
    return this.request({ method, url: url({ slug }) });
  }

  public getProductsSuggestions(params: Record<string, string>) {
    return this.request({ ...this.routes.get.suggestions, params });
  }
}

export const productService = new ProductService();
