import Http from "@/services/api/http";
import type { ListQueryPayload } from "@/lib/filter-builder-v2";
import { defaultListQuery } from "@/lib/list-query";
import type { ClientManagementRow } from "@/types/client-management.types";

export const GetClientById = (id: string | number) => {
  return Http.get<ClientManagementRow>({
    url: `/client-management/${id}`,
    messageSettings: { hideSuccessMessage: true, hideErrorMessage: false },
  });
};

export const GetAllClientManagementList = (body?: ListQueryPayload) => {
  return Http.postList<ClientManagementRow>({
    url: "/client-management/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
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
