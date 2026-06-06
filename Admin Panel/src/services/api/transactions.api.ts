import Http from "@/services/api/http";
import {
  downloadExcelReport,
  type ReportDownloadParams,
} from "@/lib/download-excel-report";
import { defaultListQuery } from "@/lib/list-query";

export interface TransactionMasterRow {
  id: number;
  payment_type_id: number;
  payment_type?: string | null;
  account?: string | null;
  project_id?: number | null;
  project_name?: string | null;
  number?: string | null;
  transaction_no: string;
  customer_id?: number | null;
  customer_name?: string | null;
  transaction_date: string;
  plan_id?: number | null;
  plan_type?: string | null;
  created_at?: string;
}

export const GetTransactionById = (id: string | number) => {
  return Http.get<TransactionMasterRow>({
    url: `/transactions-master/${id}`,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const GetAllTransactionsList = (body?: unknown) => {
  return Http.postList<TransactionMasterRow>({
    url: "/transactions-master/list",
    data: body ?? defaultListQuery,
    messageSettings: { hideSuccessMessage: true },
  });
};

export const CreateTransaction = (body?: unknown) => {
  return Http.post({
    url: "/transactions-master",
    data: body,
    messageSettings: { successMessage: "Transaction created successfully." },
  });
};

export const UpdateTransaction = (id: string | number, body?: unknown) => {
  return Http.patch({
    url: `/transactions-master/${id}`,
    data: body,
    messageSettings: { successMessage: "Transaction updated successfully." },
  });
};

export const DeleteTransaction = (id: string | number) => {
  return Http.delete({
    url: `/transactions-master/${id}`,
    messageSettings: { successMessage: "Transaction deleted successfully." },
  });
};

export const DownloadTransactionsMasterReport = (
  params: ReportDownloadParams = {}
) =>
  downloadExcelReport(
    "/transactions-master/report/download",
    "transactions_master_report",
    params
  );
