import {
  createError,
  ERROR_CLASS_MAP,
  type IAppError,
  type TErrorCode,
} from '@beautinique/backend-classes';
import type { ICreateHeaders, TApiResponse, TServiceName } from '@beautinique/backend-types';
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { SERVICES_BASE_URLS } from '../constants/index.js';
import type { TUser } from '../types/index.js';
import { createHeaders } from '../utils/index.js';

type TErrorResponse = Omit<IAppError, 'cause' | 'isOperational'>;

const isErrorCode = (code: string | undefined): code is TErrorCode =>
  !!code && code in ERROR_CLASS_MAP;

// Render's free tier can 429/502 a request while a downstream service is cold-starting -
// that's Render's own edge rejecting the request before it ever reaches the service, not the
// service itself erroring. Retrying a *real* user request a few times, a few seconds apart,
// catches the (common) case where the service was already warming up (e.g. from the periodic
// wake-up cron) and becomes reachable within seconds - without making the user wait the full
// worst-case cold-start window (which has been observed up to several minutes).
const COLD_START_RETRY_STATUSES = new Set([429, 502, 503]);
const COLD_START_RETRIES = 3;
const COLD_START_RETRY_DELAY_MS = 5_000;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class ApiRequest {
  private readonly instance: AxiosInstance;
  private readonly serviceKey: TServiceName;

  constructor(key: TServiceName) {
    this.serviceKey = key;
    this.instance = axios.create({ baseURL: SERVICES_BASE_URLS[key] });
  }

  protected async request<TData = unknown>(
    config: AxiosRequestConfig & Omit<ICreateHeaders<TUser>, 'serviceSecret'>,
  ): Promise<TApiResponse<TData>> {
    const { headers = {}, user, token, loginRole, contentType, ...restConfigs } = config;

    const customHeaders = createHeaders({
      user,
      token,
      loginRole,
      contentType,
      serviceSecret: this.serviceKey,
    });

    for (const [key, value] of Object.entries(customHeaders)) {
      headers[key] = value;
    }

    let lastError: unknown;

    for (let attempt = 0; attempt <= COLD_START_RETRIES; attempt++) {
      try {
        const response = await this.instance.request({ ...restConfigs, headers });

        return response.data as TApiResponse<TData>;
      } catch (error) {
        lastError = error;

        const isColdStartError =
          error instanceof AxiosError &&
          COLD_START_RETRY_STATUSES.has(error.response?.status ?? 0);

        if (isColdStartError && attempt < COLD_START_RETRIES) {
          await sleep(COLD_START_RETRY_DELAY_MS);
          continue;
        }

        break;
      }
    }

    if (lastError instanceof AxiosError) {
      const errResp: AxiosResponse<TErrorResponse> | undefined = lastError.response;

      const message = errResp?.data.message ?? 'API Error occurred';
      const globalErrors = errResp?.data.globalErrors;
      const fieldErrors = errResp?.data.fieldErrors;
      const statusCode = errResp?.status ?? errResp?.data.statusCode ?? 500;
      const code = isErrorCode(errResp?.data.code) ? errResp.data.code : 'INTERNAL_SERVER_ERROR';

      throw createError({ message, payload: { code, statusCode, fieldErrors, globalErrors } });
    }

    throw createError({
      message: lastError instanceof Error ? lastError.message : 'Something went wrong!',
      payload: { code: 'INTERNAL_SERVER_ERROR' },
    });
  }
}
