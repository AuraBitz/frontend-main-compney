import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type Method,
} from "axios";
import type { ShowErrorMessage } from "@/components/Notifications/notification-types";
import { API_BASE_URL, API_PREFIX } from "./config";
import type { BackendErrorResponse, BackendSuccessResponse } from "./types";

export type { ShowErrorMessage };

async function notifyHttp(
  kind: "success" | "error" | "info",
  message: string,
  settings: ShowErrorMessage
): Promise<void> {
  if (!isBrowser()) return;
  const { notifyFromHttp } = await import(
    "@/components/Notifications/notification"
  );
  notifyFromHttp(kind, message, settings);
}

interface IAPIOptions {
  url: string;
  config?: AxiosRequestConfig;
  messageSettings?: ShowErrorMessage;
  data?: unknown;
  method?: Method;
}

interface GetRequestInterface {
  url: string;
  config?: AxiosRequestConfig;
  messageSettings?: ShowErrorMessage;
  token?: string;
}

interface PostRequestInterface {
  url: string;
  data?: unknown;
  config?: AxiosRequestConfig;
  messageSettings?: ShowErrorMessage;
  token?: string;
}

type PutRequestInterface = PostRequestInterface;

type DeleteRequestInterface = PostRequestInterface;

enum StatusCode {
  NoContent = 204,
  InvalidRequest = 400,
  ResourceUnauthorized = 401,
  ClientForbidden = 403,
  ResourceNotFound = 404,
  Conflict = 409,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const headers: Readonly<Record<string, string>> = {
  Accept: "application/json",
  "Content-Type": "application/json; charset=utf-8",
};

const defaultSettings: ShowErrorMessage = {
  hideSuccessMessage: false,
  hideErrorMessage: false,
  errorMessage: "",
  successMessage: "",
};

const isBrowser = () => typeof window !== "undefined";

/** Backend + axios error body → user-facing message */
export function getErrorMessage(
  data: unknown,
  status?: number,
  fallback = "Something went wrong."
): string {
  if (!data) return fallback;

  if (typeof data === "string") return data;

  const body = data as BackendErrorResponse & {
    data?: unknown;
    errors?: unknown;
  };

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  if (typeof body.data === "string" && body.data.trim()) {
    return body.data;
  }

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    const first = body.errors[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "message" in first) {
      return String((first as { message: string }).message);
    }
  }

  switch (status) {
    case StatusCode.InvalidRequest:
      return "Invalid request.";
    case StatusCode.ResourceUnauthorized:
      return "Unauthorized access.";
    case StatusCode.ClientForbidden:
      return "Forbidden access.";
    case StatusCode.ResourceNotFound:
      return "Resource not found.";
    case StatusCode.Conflict:
      return "Conflict error.";
    case StatusCode.BadGateway:
    case StatusCode.ServiceUnavailable:
      return "Server is unavailable. Please try again.";
    default:
      return fallback;
  }
}

function unwrapResponseData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as BackendSuccessResponse<T>).success === true &&
    "data" in payload
  ) {
    return (payload as BackendSuccessResponse<T>).data;
  }
  return payload as T;
}

function mergeAuthConfig(
  config: AxiosRequestConfig = {},
  token?: string
): AxiosRequestConfig {
  if (!token) return config;
  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

const Http = async <T = unknown>(apiDataProps: IAPIOptions): Promise<T> => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${API_PREFIX}`,
    headers,
    withCredentials: true,
  });

  const {
    url: apiUrl,
    config: apiConfig = {},
    messageSettings,
    data: apiData,
    method = "get",
  } = apiDataProps;

  const settings = { ...defaultSettings, ...messageSettings };

  const handleSuccess = (response: AxiosResponse) => {
    if (!isBrowser() || settings.hideSuccessMessage) return;

    if (settings.successMessage?.trim()) {
      void notifyHttp("success", settings.successMessage, settings);
      return;
    }

    const body = response.data as BackendSuccessResponse<unknown>;
    if (typeof body?.message === "string" && body.message.trim()) {
      void notifyHttp("success", body.message, settings);
    } else if (response.status === StatusCode.NoContent) {
      void notifyHttp("info", "Nothing updated.", settings);
    }
  };

  const handleError = (response?: AxiosResponse) => {
    const status = response?.status ?? 0;
    const data = response?.data;
    const message = settings.errorMessage?.trim()
      ? settings.errorMessage
      : getErrorMessage(data, status);

    if (isBrowser() && !settings.hideErrorMessage) {
      void notifyHttp("error", message, settings);
    }

    const code =
      data && typeof data === "object" && "code" in data
        ? (data as BackendErrorResponse).code
        : null;

    return Promise.reject(new ApiError(message, status, code));
  };

  const finalConfig: AxiosRequestConfig = {
    ...apiConfig,
    ...(apiData && method !== "get" ? { data: apiData } : {}),
  };

  try {
    let response: AxiosResponse;

    switch (method) {
      case "get":
        response = await client.get(apiUrl, finalConfig);
        break;
      case "post":
        response = await client.post(apiUrl, apiData, finalConfig);
        break;
      case "put":
        response = await client.put(apiUrl, apiData, finalConfig);
        break;
      case "patch":
        response = await client.patch(apiUrl, apiData, finalConfig);
        break;
      case "delete":
        response = await client.delete(apiUrl, finalConfig);
        break;
      default:
        response = await client.request({
          ...finalConfig,
          url: apiUrl,
          method,
        });
    }

    handleSuccess(response);
    return unwrapResponseData<T>(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return handleError(error.response);
    }
    return handleError(undefined);
  }
};

Http.get = <T = unknown>({
  url,
  config,
  messageSettings,
  token,
}: GetRequestInterface): Promise<T> =>
  Http<T>({
    url,
    config: mergeAuthConfig(config, token),
    messageSettings: { ...defaultSettings, ...messageSettings },
    method: "get",
  });

Http.post = <T = unknown>({
  url,
  data,
  config,
  messageSettings,
  token,
}: PostRequestInterface): Promise<T> =>
  Http<T>({
    url,
    data,
    config: mergeAuthConfig(config, token),
    messageSettings: { ...defaultSettings, ...messageSettings },
    method: "post",
  });

Http.put = <T = unknown>({
  url,
  data,
  config,
  messageSettings,
  token,
}: PutRequestInterface): Promise<T> =>
  Http<T>({
    url,
    data,
    config: mergeAuthConfig(config, token),
    messageSettings: { ...defaultSettings, ...messageSettings },
    method: "put",
  });

Http.patch = <T = unknown>({
  url,
  data,
  config,
  messageSettings,
  token,
}: PostRequestInterface): Promise<T> =>
  Http<T>({
    url,
    data,
    config: mergeAuthConfig(config, token),
    messageSettings: { ...defaultSettings, ...messageSettings },
    method: "patch",
  });

Http.delete = <T = unknown>({
  url,
  data,
  config,
  messageSettings,
  token,
}: DeleteRequestInterface): Promise<T> =>
  Http<T>({
    url,
    data,
    config: mergeAuthConfig(config, token),
    messageSettings: { ...defaultSettings, ...messageSettings },
    method: "delete",
  });

export default Http;
