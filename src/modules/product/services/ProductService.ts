import type { TUpdateProductApprovalStatusZodSchema } from '@beautinique/backend-types';

import { BaseProductService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { IUser, TUser } from '../../../types/index.js';

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

  public updateProductApprovalStatus(
    admin: TUser,
    productId: string,
    data: TUpdateProductApprovalStatusZodSchema,
  ) {
    const { method, url } = this.routes.updateApprovalStatus;

    return this.request({ method, url: url({ productId }), data, user: admin });
  }

  /* ================== DELETE METHODS ================== */

  /* ================== GET METHODS ================== */

  public getDraftProduct(user: TUser) {
    return this.request({ ...this.routes.draft.get, user });
  }

  public getDashboardProducts({ user, params }: IUser & { params?: Record<string, string> }) {
    return this.request({ ...this.routes.get.dashboard.products, user, params });
  }

  /* ================== PRODUCT QUEUE ("My Queue") ================== */
  public getProductQueue(user: TUser, params?: Record<string, string>) {
    return this.request({ ...this.routes.queue, user, params });
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
