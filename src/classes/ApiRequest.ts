import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { ApiError } from './ApiError';
import { API_ROUTES_AND_METHODS, SERVICES_BASE_URLS } from '@/constants';

export class ApiRequest {
  private instance: AxiosInstance;
  private baseURLs = SERVICES_BASE_URLS;

  constructor(key: keyof typeof SERVICES_BASE_URLS) {
    const baseURL = this.baseURLs[key];
    this.instance = axios.create({ baseURL });
  }

  protected routes = API_ROUTES_AND_METHODS;
  protected request = async (config: AxiosRequestConfig) => {
    try {
      const { data } = await this.instance.request(config);
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'API Error occurred';
        const globalErrors = error.response?.data?.globalErrors;
        const fieldErrors = error.response?.data?.fieldErrors;
        const statusCode = error.response?.status || 500;
        throw new ApiError({ message, globalErrors, fieldErrors, statusCode });
      }
      if (error instanceof Error) {
        throw new ApiError({ message: error.message, statusCode: 500 });
      }
      throw new ApiError({ message: 'Something went wrong!', statusCode: 500 });
    }
  };
}
