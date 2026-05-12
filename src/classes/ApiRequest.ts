import { AppError, type AppSuccess } from '@beautinique/be-classes';
import type { TService } from '@beautinique/be-constants';
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import {
  API_ROUTES_AND_METHODS,
  HEADERS_KEYS,
  SERVICES_BASE_URLS,
  SERVICE_SECRET_MAP,
} from '../constants';

export class ApiRequest {
  private instance: AxiosInstance;
  private baseURLs = SERVICES_BASE_URLS;
  private secret: (typeof SERVICE_SECRET_MAP)[TService];

  constructor(key: keyof typeof SERVICES_BASE_URLS) {
    const baseURL = this.baseURLs[key];
    this.secret = SERVICE_SECRET_MAP[key];
    this.instance = axios.create({ baseURL });
  }

  protected routes = API_ROUTES_AND_METHODS;
  protected request = async (config: AxiosRequestConfig) => {
    try {
      const { headers, ...restConfigs } = config ?? {};
      const { data } = await this.instance.request({
        ...restConfigs,
        headers: { ...headers, [HEADERS_KEYS.serviceSecret]: this.secret },
      });
      return data as AppSuccess;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'API Error occurred';
        const globalErrors = error.response?.data?.globalErrors;
        const fieldErrors = error.response?.data?.fieldErrors;
        const statusCode = error.response?.status || error.response?.data?.statusCode || 500;
        const code = error.response?.data?.code;
        throw new AppError({ message, globalErrors, fieldErrors, statusCode, code });
      }
      throw new AppError({
        message: error instanceof Error ? error.message : 'Something went wrong!',
        code: 'INTERNAL_SERVER_ERROR',
      });
    }
  };
}
