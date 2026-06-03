export type ProductStatus = "active" | "inactive" | "draft";

export interface Product {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  version: string;
  description: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  slug: string;
  status: ProductStatus;
  version: string;
  description: string;
}
