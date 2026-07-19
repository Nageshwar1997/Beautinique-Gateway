import {
  createError,
  ERROR_CLASS_MAP,
  type IAppError,
  type TErrorCode,
} from '@beautinique/backend-classes';
import type { TServiceName } from '@beautinique/backend-types';
import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios';

import { SERVICES_BASE_URLS } from '../constants/index.js';
import type { ICreateHeaders, TApiResponse } from '../types/index.js';
import { createHeaders } from '../utils/index.js';

type TErrorResponse = Omit<IAppError, 'cause' | 'isOperational'>;

const isErrorCode = (code: string | undefined): code is TErrorCode =>
  !!code && code in ERROR_CLASS_MAP;

export class ApiRequest {
  private readonly instance: AxiosInstance;
  private readonly serviceKey: TServiceName;

  constructor(key: TServiceName) {
    this.serviceKey = key;
    this.instance = axios.create({ baseURL: SERVICES_BASE_URLS[key] });
  }

  protected async request<TData = unknown>(
    config: AxiosRequestConfig & Omit<ICreateHeaders, 'serviceSecret'>,
  ): Promise<TApiResponse<TData>> {
    try {
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

      const response = await this.instance.request({ ...restConfigs, headers });

      return response.data as TApiResponse<TData>;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errResp: AxiosResponse<TErrorResponse> | undefined = error.response;

        const message = errResp?.data.message ?? 'API Error occurred';
        const globalErrors = errResp?.data.globalErrors;
        const fieldErrors = errResp?.data.fieldErrors;
        const statusCode = errResp?.status ?? errResp?.data.statusCode ?? 500;
        const code = isErrorCode(errResp?.data.code) ? errResp.data.code : 'INTERNAL_SERVER_ERROR';

        throw createError({ message, payload: { code, statusCode, fieldErrors, globalErrors } });
      }

      throw createError({
        message: error instanceof Error ? error.message : 'Something went wrong!',
        payload: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
  }
}
