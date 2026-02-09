import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type {
  IApiRequestService,
  RequestConfig,
  RequestOptions,
} from "./api-request-service.type";

/**
 * 请求服务配置选项
 */
export type ApiRequestServiceOptions = {
  /** 基础 URL */
  baseURL: string;
  /** 默认超时时间（毫秒） */
  timeout?: number;
  /** 默认请求头 */
  headers?: Record<string, string>;
}

/**
 * 基于 Axios 的请求服务实现
 * 实现 IRequestService 接口，隔离 axios 的具体实现
 * 直接返回 response.data，header 等处理由 interceptor 完成
 */
export class ApiRequestService implements IApiRequestService {
  private axiosInstance: AxiosInstance;

  constructor(options: ApiRequestServiceOptions) {
    this.axiosInstance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 30000,
      headers: options.headers,
    });
  }

  /**
   * 将内部 RequestConfig 转换为 AxiosRequestConfig
   */
  private getAxiosConfig(config?: RequestConfig): AxiosRequestConfig {
    if (!config) return {};

    return {
      headers: config.headers,
      params: config.params,
      timeout: config.timeout,
      responseType: config.responseType,
      withCredentials: config.withCredentials,
      signal: config.signal,
    };
  }

  async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(
      url,
      this.getAxiosConfig(config)
    );
    return response.data;
  }

  async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.post<T>(
      url,
      data,
      this.getAxiosConfig(config)
    );
    return response.data;
  }

  async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.put<T>(
      url,
      data,
      this.getAxiosConfig(config)
    );
    return response.data;
  }

  async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const response = await this.axiosInstance.patch<T>(
      url,
      data,
      this.getAxiosConfig(config)
    );
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(
      url,
      this.getAxiosConfig(config)
    );
    return response.data;
  }

  async head<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.head<T>(
      url,
      this.getAxiosConfig(config)
    );
    return response.data;
  }

  async request<T = unknown>(options: RequestOptions): Promise<T> {
    const { method, url, data, ...config } = options;
    const axiosConfig: AxiosRequestConfig = {
      ...this.getAxiosConfig(config),
      method,
      url,
      data,
    };
    const response = await this.axiosInstance.request<T>(axiosConfig);
    return response.data;
  }

  /**
   * 获取底层 axios 实例（用于配置 interceptor）
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  bootstrap() {
    // todo
  }

  dispose() {
    // todo
  }
}
