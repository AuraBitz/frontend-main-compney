"use client";

import { toast, type ToastOptions } from "react-toastify";
import {
  NOTIFICATION_TYPE_SUCCESS,
  NOTIFICATION_TYPE_ERROR,
  NOTIFICATION_TYPE_INFO,
  NOTIFICATION_TYPE_WARNING,
  type NotificationType,
  type ShowErrorMessage,
} from "./notification-types";

export {
  NOTIFICATION_TYPE_SUCCESS,
  NOTIFICATION_TYPE_ERROR,
  NOTIFICATION_TYPE_INFO,
  NOTIFICATION_TYPE_WARNING,
  type NotificationType,
  type ShowErrorMessage,
} from "./notification-types";

interface NotificationProps {
  type: NotificationType;
  message: string;
  options?: ToastOptions;
}

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const toastByType: Record<
  NotificationType,
  (message: string, options?: ToastOptions) => ReturnType<typeof toast>
> = {
  [NOTIFICATION_TYPE_SUCCESS]: toast.success,
  [NOTIFICATION_TYPE_ERROR]: toast.error,
  [NOTIFICATION_TYPE_INFO]: toast.info,
  [NOTIFICATION_TYPE_WARNING]: toast.warning,
};

export const Notification = ({ type, message, options }: NotificationProps) => {
  const text = message?.trim() || "Something went wrong.";
  const merged = { ...defaultOptions, ...options };
  const show = toastByType[type] ?? toast;
  return show(text, merged);
};

/** Used by http.tsx — maps API result to toast type */
export function notify(
  type: NotificationType,
  message: string,
  options?: ToastOptions
): void {
  Notification({ type, message, options });
}

export function notifySuccess(message: string): void {
  notify(NOTIFICATION_TYPE_SUCCESS, message);
}

export function notifyError(message: string): void {
  notify(NOTIFICATION_TYPE_ERROR, message);
}

export function notifyInfo(message: string): void {
  notify(NOTIFICATION_TYPE_INFO, message);
}

/** messageSettings from Http → show toast when allowed */
export function notifyFromHttp(
  kind: "success" | "error" | "info",
  message: string,
  settings?: ShowErrorMessage
): void {
  if (!message.trim()) return;

  if (kind === "success" && settings?.hideSuccessMessage) return;
  if (kind === "error" && settings?.hideErrorMessage) return;

  const type =
    kind === "success"
      ? NOTIFICATION_TYPE_SUCCESS
      : kind === "error"
        ? NOTIFICATION_TYPE_ERROR
        : NOTIFICATION_TYPE_INFO;

  notify(type, message);
}
