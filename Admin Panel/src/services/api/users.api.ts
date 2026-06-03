import Http from "@/services/api/http";

export const GetAllUsersList = (body?: unknown) => {
  return Http.post({
    url: "/users/list",
    data: body,
  });
};

export const UpdateUser = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/users/${id}`,
    data: body,
    messageSettings: { successMessage: "User updated successfully." },
  });
};

export const DeleteUser = (id: string | number) => {
  return Http.delete({
    url: `/users/${id}`,
    messageSettings: { successMessage: "User deleted successfully." },
  });
};
