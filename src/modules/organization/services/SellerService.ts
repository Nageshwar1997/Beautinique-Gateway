import type {
  TDraftSellerStepBodyZodSchema,
  TUpdateSellerApprovalStatusZodSchema,
} from '@beautinique/backend-types';

import { BaseOrganizationService } from '../../../classes/index.js';
import { API_METHODS_AND_URLS } from '../../../constants/index.js';
import type { TUser } from '../../../types/index.js';

class SellerService extends BaseOrganizationService {
  private routes = API_METHODS_AND_URLS.organization_service.seller;

  /* ================== GET DRAFT SELLER ================== */
  public getDraftSeller(user: TUser) {
    return this.request({ ...this.routes.draft.get, user });
  }

  /* ================== SAVE DRAFT SELLER ================== */
  public saveDraftSeller(user: TUser, data: TDraftSellerStepBodyZodSchema) {
    return this.request({ ...this.routes.draft.save, data, user });
  }

  /* ================== CREATE SELLER ================== */
  public createSeller(user: TUser) {
    return this.request({ ...this.routes.draft.submit, user });
  }

  public updateSellerApprovalStatus(
    seller: TUser,
    sellerId: string,
    data: TUpdateSellerApprovalStatusZodSchema,
  ) {
    const { method, url } = this.routes.updateApprovalStatus;

    return this.request({ method, url: url({ sellerId }), data, user: seller });
  }

  /* ================== SELLER QUEUE ("My Queue") ================== */
  public getSellerQueue(user: TUser, params?: Record<string, string>) {
    return this.request({ ...this.routes.queue, user, params });
  }
}

export const sellerService = new SellerService();
