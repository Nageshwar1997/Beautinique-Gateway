import { AppError, type AppSuccess } from '@beautinique/be-classes';
import type { TService } from '@beautinique/be-constants';
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { API_METHODS_AND_URLS, SERVICES_BASE_URLS } from '../constants';
import type { ICreateHeaders } from '../types';
import { createHeaders } from '../utils';

export class ApiRequest {
  private instance: AxiosInstance;
  private baseURLs = SERVICES_BASE_URLS;
  private serviceKey: TService;

  constructor(key: TService) {
    const baseURL = this.baseURLs[key];
    this.serviceKey = key;
    this.instance = axios.create({ baseURL });
  }

  protected routes = API_METHODS_AND_URLS;
  protected request = async (
    config: AxiosRequestConfig & Omit<ICreateHeaders, 'serviceSecret'>,
  ) => {
    try {
      const { headers, user, token, loginRole, contentType, ...restConfigs } = config;

      const { data } = await this.instance.request({
        ...restConfigs,
        headers: {
          ...createHeaders({ user, token, loginRole, contentType, serviceSecret: this.serviceKey }),
          ...headers,
        },
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
