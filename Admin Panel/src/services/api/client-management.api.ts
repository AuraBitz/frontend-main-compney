import Http from "@/services/api/http";
import type { ClientManagementRow } from "@/types/client-management.types";

export const GetAllClientManagementList = (body?: {
  skip?: number;
  limit?: number;
  sort?: string;
  filters?: Record<string, unknown>;
}) => {
  return Http.post<ClientManagementRow[]>({
    url: "/client-management/list",
    data: body ?? { skip: 0, limit: 100 },
  });
};

export const CreateClientManagement = (body?: unknown) => {
  return Http.post({
    url: "/client-management",
    data: body,
    messageSettings: { successMessage: "Client created successfully." },
  });
};

export const UpdateClientManagement = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/client-management/${id}`,
    data: body,
    messageSettings: { successMessage: "Client updated successfully." },
  });
};

export const DeleteClientManagement = (id: string | number) => {
  return Http.delete({
    url: `/client-management/${id}`,
    messageSettings: { successMessage: "Client deleted successfully." },
  });
};
