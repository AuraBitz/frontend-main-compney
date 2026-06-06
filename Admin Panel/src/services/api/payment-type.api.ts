import Http from "@/services/api/http";
import { defaultListQuery } from "@/lib/list-query";

export interface PaymentTypeMasterRow {
  id: number;
  type: string;
  status: string;
  created_at?: string;
  created_by?: number | null;
  created_by_name?: string | null;
}

export const GetPaymentTypeById = (id: string | number) => {
  return Http.get<PaymentTypeMasterRow>({
    url: `/payment-type-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllPaymentTypesList = (body?: unknown) => {
  return Http.postList<PaymentTypeMasterRow>({
    url: "/payment-type-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreatePaymentType = (body?: unknown) => {
  return Http.post({
    url: "/payment-type-master",
    data: body,
    messageSettings: { successMessage: "Payment type created successfully." },
  });
};

export const UpdatePaymentType = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/payment-type-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Payment type updated successfully." },
  });
};

export const DeletePaymentType = (id: string | number) => {
  return Http.delete({
    url: `/payment-type-master/${id}`,
    messageSettings: { successMessage: "Payment type deleted successfully." },
  });
};
