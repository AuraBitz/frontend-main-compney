import Http from "@/services/api/http";

export const GetAllProductsList = (body?: unknown) => {
  return Http.post({
    url: "/products/list",
    data: body,
  });
};

export const CreateProduct = (body?: unknown) => {
  return Http.post({
    url: "/products",
    data: body,
    messageSettings: { successMessage: "Product created successfully." },
  });
};

export const UpdateProduct = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/products/${id}`,
    data: body,
    messageSettings: { successMessage: "Product updated successfully." },
  });
};

export const DeleteProduct = (id: string | number) => {
  return Http.delete({
    url: `/products/${id}`,
    messageSettings: { successMessage: "Product deleted successfully." },
  });
};
