import Http from "@/services/api/http";

export const GetAllFilesList = (params?: Record<string, string>) => {
  return Http.get({
    url: "/files/list",
    config: { params },
  });
};

export const UploadFile = (body?: { path: string; fileName: string }) => {
  return Http.post({
    url: "/files/upload",
    data: body,
    messageSettings: { successMessage: "File uploaded successfully." },
  });
};

export const DeleteFile = (id: string | number) => {
  return Http.delete({
    url: `/files/${id}`,
    messageSettings: { successMessage: "File deleted successfully." },
  });
};
