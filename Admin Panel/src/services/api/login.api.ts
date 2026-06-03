import Http from "@/services/api/http";
import {
  buildLoginPayload,
  type BackendLoginPayload,
} from "@/lib/login-payload";

const silentRequest = {
  hideSuccessMessage: true,
  hideErrorMessage: true,
} as const;

export type { BackendLoginPayload };

export interface BackendLoginAccount {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  device_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BackendLoginData {
  user: BackendLoginAccount;
  token: string;
  tokenType: string;
  expiresIn: string;
}

/** Login with email or username + password (backend accepts either) */
export const Login = (usernameOrEmail: string, password: string) => {
  const data = buildLoginPayload(usernameOrEmail, password);
  return Http.post<BackendLoginData>({
    url: "/client-login/login",
    data,
    messageSettings: silentRequest,
  });
};

export const Logout = (token?: string) => {
  return Http.post({
    url: "/client-login/logout",
    token,
    messageSettings: silentRequest,
  });
};

export const GetMe = (token?: string) => {
  return Http.get<BackendLoginAccount>({
    url: "/client-login/me",
    token,
    messageSettings: silentRequest,
  });
};
