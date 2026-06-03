import Http from "@/services/api/http";

export const GetAllClientLoginList = (body?: unknown) => {
  return Http.post({
    url: "/client-login/list",
    data: body,
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
