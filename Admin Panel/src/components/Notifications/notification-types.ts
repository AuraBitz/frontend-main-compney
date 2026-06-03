export const NOTIFICATION_TYPE_SUCCESS = "success";
export const NOTIFICATION_TYPE_ERROR = "error";
export const NOTIFICATION_TYPE_INFO = "info";
export const NOTIFICATION_TYPE_WARNING = "warning";

export type NotificationType =
  | typeof NOTIFICATION_TYPE_SUCCESS
  | typeof NOTIFICATION_TYPE_ERROR
  | typeof NOTIFICATION_TYPE_INFO
  | typeof NOTIFICATION_TYPE_WARNING;

export interface ShowErrorMessage {
  hideSuccessMessage?: boolean;
  hideErrorMessage?: boolean;
  errorMessage?: string;
  successMessage?: string;
}
