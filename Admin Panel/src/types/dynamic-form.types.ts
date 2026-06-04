import type { ListApiObject } from "@/types/list-api.types";

export interface InputSidebarColumnDef {
  key: string;
  label: string;
  minWidth?: string;
}

export type DynamicFieldType =
  | "text"
  | "email"
  | "tel"
  | "password"
  | "textarea"
  | "number"
  | "date"
  | "checkbox"
  | "select"
  | "multiselect"
  | "api-select"
  | "input-sidebar";

export type DynamicFormMode = "create" | "edit" | "view";

export interface DynamicSelectOption {
  label: string;
  value: string;
}

export interface ApiSelectFieldKeys {
  label: string;
  val: string;
}

export interface DynamicFormField {
  name: string;
  label: string;
  type: DynamicFieldType;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  readOnly?: boolean;
  fullWidth?: boolean;
  options?: DynamicSelectOption[];
  condition?: (formData: Record<string, unknown>) => boolean;
  validate?: (
    value: unknown,
    formData: Record<string, unknown>
  ) => true | string;
  /** api-select / input-sidebar */
  apiObject?: ListApiObject;
  selectedDataKey?: ApiSelectFieldKeys;
  isWholeObject?: boolean;
  displayedData?: string;
  /** input-sidebar */
  selectedData?: string;
  rowValueKey?: string;
  sheetTitle?: string;
  displayFields?: string[];
  customColumnDefs?: InputSidebarColumnDef[];
  multiSelect?: boolean;
  cacheFieldName?: string;
  viewDisplayResolver?: (formData: Record<string, unknown>) => string;
}

export interface DynamicFormTab {
  id: string;
  label: string;
}

export interface DynamicFormSection {
  title: string;
  tab?: string;
  gridCols?: string;
  fields: DynamicFormField[];
}

export interface DynamicFormConfig {
  title: string;
  subtitle?: string;
  mode: DynamicFormMode;
  initialData: Record<string, unknown>;
  sections: DynamicFormSection[];
  tabs?: DynamicFormTab[];
  submitLabel?: string;
  cancelLabel?: string;
  showBackButton?: boolean;
  stickyFooter?: boolean;
}
