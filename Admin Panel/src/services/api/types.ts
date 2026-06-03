export interface BackendSuccessResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface BackendErrorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  code?: string | null;
  errors?: unknown;
}
