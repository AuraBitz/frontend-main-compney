import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { ClientManagementRow } from "@/types/client-management.types";
import {
  planListApiObject,
  projectListApiObject,
  restaurantListApiObject,
} from "@/lib/form-api-objects";

const LOGIN_STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export interface ClientLoginFormSlice {
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface ClientFormOptions {
  planOptions?: DynamicSelectOption[];
  projectOptions?: DynamicSelectOption[];
  restaurantOptions?: DynamicSelectOption[];
}

export function getEmptyClientFormData(): Record<string, unknown> {
  return {
    restaurant_id: "",
    contact_name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    project_id: "",
    plan_id: "",
    _project_label: "",
    _plan_label: "",
    _restaurant_label: "",
    login_id: "",
    username: "",
    login_email: "",
    password: "",
    login_status: "active",
  };
}

export function mapClientToFormData(
  row: ClientManagementRow,
  login?: ClientLoginFormSlice | null
): Record<string, unknown> {
  let contact_name = String(row.owner_name ?? "").trim();
  if (!row.restaurant_name && row.owner_name?.includes(" / ")) {
    const parts = row.owner_name.split(" / ");
    contact_name = parts[1]?.trim() ?? contact_name;
  }

  return {
    restaurant_id:
      row.restaurant_id != null ? String(row.restaurant_id) : "",
    contact_name,
    mobile: row.mobile ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country ?? "",
    project_id: row.project_id != null ? String(row.project_id) : "",
    plan_id: row.plan_id != null ? String(row.plan_id) : "",
    _project_label: row.project_name ?? "",
    _plan_label: row.plan_type ?? "",
    _restaurant_label: row.restaurant_name ?? "",
    login_id: row.login_id != null ? String(row.login_id) : "",
    username: login?.username ?? "",
    login_email: login?.email ?? "",
    password: "",
    login_status: login?.status ?? "active",
  };
}

/** Resolve display labels for sidebar/api-select fields on edit & view */
export function enrichClientFormData(
  data: Record<string, unknown>,
  options: ClientFormOptions = {}
): Record<string, unknown> {
  const next = { ...data };
  const projectId = String(next.project_id ?? "");
  const planId = String(next.plan_id ?? "");
  const restaurantId = String(next.restaurant_id ?? "");
  if (!String(next._project_label ?? "").trim()) {
    next._project_label =
      options.projectOptions?.find((o) => o.value === projectId)?.label ?? "";
  }
  if (!String(next._plan_label ?? "").trim()) {
    next._plan_label =
      options.planOptions?.find((o) => o.value === planId)?.label ?? "";
  }
  if (!String(next._restaurant_label ?? "").trim()) {
    next._restaurant_label =
      options.restaurantOptions?.find((o) => o.value === restaurantId)?.label ??
      "";
  }
  return next;
}

export function mapFormToLoginPayload(
  data: Record<string, unknown>,
  forUpdate = false
) {
  const payload: Record<string, unknown> = {
    username: String(data.username ?? "").trim(),
    email: String(data.login_email ?? "").trim(),
    role: "client",
    status: String(data.login_status ?? "active").toLowerCase(),
  };

  const password = String(data.password ?? "");
  if (password) {
    payload.password = password;
  } else if (!forUpdate) {
    payload.password = "";
  }
  return payload;
}

export function mapFormToClientPayload(
  data: Record<string, unknown>,
  loginId?: number | null
) {
  const contact = String(data.contact_name ?? "").trim();
  const owner_name = contact;

  const planId = data.plan_id ? Number(data.plan_id) : null;
  const projectId = data.project_id ? Number(data.project_id) : null;
  const restaurantRaw = String(data.restaurant_id ?? "").trim();
  const restaurantId = restaurantRaw ? Number(restaurantRaw) : null;
  const resolvedLoginId =
    loginId ?? (data.login_id ? Number(data.login_id) : null);

  return {
    restaurant_id:
      restaurantId != null && Number.isFinite(restaurantId)
        ? restaurantId
        : null,
    owner_name,
    mobile: String(data.mobile ?? "").trim() || null,
    email: String(data.email ?? "").trim() || null,
    address: String(data.address ?? "").trim() || null,
    city: String(data.city ?? "").trim() || null,
    state: String(data.state ?? "").trim() || null,
    country: String(data.country ?? "").trim() || null,
    plan_status: "Active",
    plan_id: Number.isFinite(planId) ? planId : null,
    project_id: Number.isFinite(projectId) ? projectId : null,
    login_id: Number.isFinite(resolvedLoginId) ? resolvedLoginId : null,
  };
}

function clientDetailFields(readOnly: boolean) {
  return [
    {
      name: "restaurant_id",
      label: "Select Restaurant",
      type: "input-sidebar" as const,
      required: true,
      placeholder: "Click to choose restaurant",
      apiObject: restaurantListApiObject,
      selectedData: "restaurant_id",
      rowValueKey: "id",
      displayedData: "restaurant_name",
      displayFields: ["restaurant_name", "restaurant_mobile", "status"],
      customColumnDefs: [
        { key: "restaurant_name", label: "Restaurant" },
        { key: "restaurant_mobile", label: "Mobile" },
        { key: "status", label: "Status" },
      ],
      cacheFieldName: "_restaurant_label",
      readOnly,
    },
    {
      name: "contact_name",
      label: "Owner Name",
      type: "text" as const,
      required: true,
      placeholder: "Owner / contact person name",
      readOnly,
    },
    {
      name: "mobile",
      label: "Mobile",
      type: "tel" as const,
      required: true,
      placeholder: "+91-9876543210",
      readOnly,
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      placeholder: "client@example.com",
      readOnly,
    },
    {
      name: "address",
      label: "Address",
      type: "textarea" as const,
      rows: 3,
      fullWidth: true,
      readOnly,
    },
    {
      name: "city",
      label: "City",
      type: "text" as const,
      readOnly,
    },
    {
      name: "state",
      label: "State",
      type: "text" as const,
      placeholder: "State",
      readOnly,
    },
    {
      name: "country",
      label: "Country",
      type: "text" as const,
      readOnly,
    },
    {
      name: "project_id",
      label: "Select Project",
      type: "input-sidebar" as const,
      placeholder: "Click to choose project",
      apiObject: projectListApiObject,
      selectedData: "project_id",
      rowValueKey: "id",
      displayedData: "name",
      displayFields: ["name", "status"],
      customColumnDefs: [
        { key: "name", label: "Project Name" },
        { key: "status", label: "Status" },
      ],
      cacheFieldName: "_project_label",
      readOnly,
    },
    {
      name: "plan_id",
      label: "Select Plan",
      type: "api-select" as const,
      placeholder: "Select plan",
      apiObject: planListApiObject,
      selectedDataKey: { label: "plan_type", val: "id" },
      displayedData: "plan_type",
      cacheFieldName: "_plan_label",
      readOnly,
    },
  ];
}

function loginDetailFields(
  readOnly: boolean,
  mode: "create" | "edit" | "view"
) {
  return [
    {
      name: "username",
      label: "Username",
      type: "text" as const,
      required: !readOnly,
      placeholder: "Login username",
      readOnly,
    },
    {
      name: "login_email",
      label: "Email",
      type: "email" as const,
      required: !readOnly,
      placeholder: "login@example.com",
      readOnly,
    },
    {
      name: "password",
      label: "Password",
      type: "password" as const,
      required: mode === "create",
      placeholder:
        mode === "edit" ? "Leave blank to keep current" : "Min 6 characters",
      readOnly,
      condition: () => mode !== "view",
    },
    {
      name: "login_status",
      label: "Status",
      type: "select" as const,
      options: LOGIN_STATUS_OPTIONS,
      readOnly,
    },
  ];
}

export function buildClientFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>,
  _formOptions: ClientFormOptions = {}
): DynamicFormConfig {
  const readOnly = mode === "view";

  const loginFields = loginDetailFields(readOnly, mode);

  return {
    title:
      mode === "view"
        ? "View Client"
        : mode === "edit"
          ? "Edit Client"
          : "Create Client",
    subtitle:
      mode === "view"
        ? "Client and login details (read-only)."
        : mode === "edit"
          ? "Update client and login information."
          : "Add client and login account.",
    mode,
    showBackButton: false,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Client" : "Create Client",
    cancelLabel: "Back",
    tabs: [
      { id: "client", label: "Client Details" },
      { id: "login", label: "Login Details" },
    ],
    initialData,
    sections: [
      {
        title: "Client Details",
        tab: "client",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: clientDetailFields(readOnly).map((f) => {
          if (f.name === "restaurant_id") {
            return {
              ...f,
              viewDisplayResolver: (fd: Record<string, unknown>) =>
                String(fd._restaurant_label ?? fd.restaurant_id ?? ""),
            };
          }
          if (f.name === "project_id") {
            return {
              ...f,
              viewDisplayResolver: (fd: Record<string, unknown>) =>
                String(fd._project_label ?? fd.project_id ?? ""),
            };
          }
          if (f.name === "plan_id") {
            return {
              ...f,
              viewDisplayResolver: (fd: Record<string, unknown>) =>
                String(fd._plan_label ?? fd.plan_id ?? ""),
            };
          }
          return f;
        }),
      },
      {
        title: "Login Details",
        tab: "login",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: loginFields,
      },
    ],
  };
}
