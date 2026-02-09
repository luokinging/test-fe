/**
 * 通用请求配置
 */
export interface RequestConfig {
  /** 请求头 */
  headers?: Record<string, string>;
  /** URL 查询参数 */
  params?: Record<string, unknown>;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 响应类型 */
  responseType?: "json" | "text" | "blob" | "arraybuffer";
  /** 是否携带凭证 */
  withCredentials?: boolean;
  /** 取消信号 */
  signal?: AbortSignal;
}

/**
 * 通用请求参数（用于 request 方法）
 */
export interface RequestOptions extends RequestConfig {
  /** HTTP 方法 */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";
  /** 请求地址 */
  url: string;
  /** 请求体数据 */
  data?: unknown;
}

/**
 * 请求服务接口
 * 抽象 HTTP 请求层，隔离具体实现（如 axios）
 * 返回值直接为后端响应数据，header 等处理由 interceptor 完成
 */
export interface IApiRequestService {
  /**
   * 发送 GET 请求
   */
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T>;

  /**
   * 发送 POST 请求
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T>;

  /**
   * 发送 PUT 请求
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T>;

  /**
   * 发送 PATCH 请求
   */
  patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T>;

  /**
   * 发送 DELETE 请求
   */
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T>;

  /**
   * 发送 HEAD 请求
   */
  head<T = unknown>(url: string, config?: RequestConfig): Promise<T>;

  /**
   * 发送通用请求
   */
  request<T = unknown>(options: RequestOptions): Promise<T>;

  bootstrap(): void;

  dispose(): void;
}