import axios from "axios";
import { API_PREFIX } from "@/services/api/config";

export interface ReportDownloadParams {
  start_date?: string;
  end_date?: string;
}

export async function downloadExcelReport(
  urlPath: string,
  filenamePrefix: string,
  params: ReportDownloadParams = {}
) {
  const response = await axios.post(
    `${API_PREFIX}${urlPath}`,
    {
      start_date: params.start_date || "",
      end_date: params.end_date || "",
    },
    {
      responseType: "blob",
      withCredentials: true,
    }
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = objectUrl;
  link.download = `${filenamePrefix}_${stamp}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
