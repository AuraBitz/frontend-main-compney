import Http from "@/services/api/http";

export interface ClientLoginRow {
  id: number;
  username: string;
  email: string;
  role?: string;
  project_role_id?: number | null;
  status: string;
  device_id?: string | null;
  created_at?: string;
}

export const GetClientLoginById = (id: string | number) => {
  return Http.get<ClientLoginRow>({
    url: `/client-login/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllClientLoginList = (body?: unknown) => {
  return Http.postList<ClientLoginRow>({
    url: "/client-login/list",
    data: body,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateClientLogin = (body?: unknown) => {
  return Http.post({
    url: "/client-login",
    data: body,
    messageSettings: { successMessage: "Login account created successfully." },
  });
};

export const UpdateClientLogin = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/client-login/${id}`,
    data: body,
    messageSettings: { successMessage: "Login account updated successfully." },
  });
};

export const DeleteClientLogin = (id: string | number) => {
  return Http.delete({
    url: `/client-login/${id}`,
    messageSettings: { successMessage: "Login account deleted successfully." },
  });
};
