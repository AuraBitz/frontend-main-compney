import type { DynamicFormConfig, DynamicSelectOption } from "@/types/dynamic-form.types";
import type { RestaurantMasterRow } from "@/services/api/restaurant-master.api";

const STATUS_OPTIONS: DynamicSelectOption[] = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
];

export function getEmptyRestaurantFormData(): Record<string, unknown> {
  return {
    restaurant_name: "",
    owner_name: "",
    restaurant_address: "",
    city: "",
    state: "",
    country: "",
    restaurant_mobile: "",
    status: "offline",
    username: "",
    login_email: "",
    password: "",
    project_id: "",
    _project_label: "",
  };
}

export function mapRestaurantToFormData(
  row: RestaurantMasterRow
): Record<string, unknown> {
  return {
    restaurant_name: row.restaurant_name ?? "",
    owner_name: row.owner_name ?? "",
    restaurant_address: row.restaurant_address ?? "",
    city: row.city ?? "",
    state: row.state ?? "",
    country: row.country ?? "",
    restaurant_mobile: row.restaurant_mobile ?? "",
    status: row.status ?? "offline",
    project_id: row.project_id != null ? String(row.project_id) : "",
    _project_label: row.project_name ?? "",
    username: "",
    login_email: "",
    password: "",
  };
}

export function mapFormToRestaurantPayload(data: Record<string, unknown>) {
  const ownerName = String(data.owner_name ?? "").trim();
  return {
    restaurant_name: String(data.restaurant_name ?? "").trim(),
    owner_name: ownerName || String(data.restaurant_name ?? "").trim(),
    restaurant_address: String(data.restaurant_address ?? "").trim() || null,
    city: String(data.city ?? "").trim() || null,
    state: String(data.state ?? "").trim() || null,
    country: String(data.country ?? "").trim() || null,
    restaurant_mobile: String(data.restaurant_mobile ?? "").trim() || null,
    status: String(data.status ?? "offline").toLowerCase(),
    project_id: (() => {
      const raw = String(data.project_id ?? "").trim();
      const parsed = raw ? Number(raw) : null;
      return parsed != null && Number.isFinite(parsed) ? parsed : null;
    })(),
  };
}

export function mapFormToRestaurantLoginPayload(data: Record<string, unknown>) {
  return {
    username: String(data.username ?? "").trim(),
    email: String(data.login_email ?? "").trim(),
    password: String(data.password ?? ""),
    role: "client",
    status: "active",
  };
}

function restaurantDetailFields(readOnly: boolean) {
  return [
    {
      name: "restaurant_name",
      label: "Restaurant Name",
      type: "text" as const,
      required: true,
      placeholder: "e.g. Spice Garden",
      readOnly,
    },
    {
      name: "owner_name",
      label: "Owner Name",
      type: "text" as const,
      required: true,
      placeholder: "Owner / contact person",
      readOnly,
    },
    {
      name: "restaurant_address",
      label: "Restaurant Address",
      type: "textarea" as const,
      rows: 3,
      fullWidth: true,
      placeholder: "Street address",
      readOnly,
    },
    {
      name: "city",
      label: "City",
      type: "text" as const,
      placeholder: "City",
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
      placeholder: "Country",
      readOnly,
    },
    {
      name: "restaurant_mobile",
      label: "Restaurant Mobile",
      type: "tel" as const,
      placeholder: "e.g. 9876543210",
      readOnly,
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: STATUS_OPTIONS,
      readOnly,
    },
  ].map((field) => {
    if (field.name === "status") {
      return {
        ...field,
        viewDisplayResolver: (fd: Record<string, unknown>) => {
          const v = String(fd.status ?? "").toLowerCase();
          return v === "online" ? "Online" : v === "offline" ? "Offline" : v;
        },
      };
    }
    return field;
  });
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
  ];
}

export function buildRestaurantFormConfig(
  mode: "create" | "edit" | "view",
  initialData: Record<string, unknown>
): DynamicFormConfig {
  const readOnly = mode === "view";

  return {
    title:
      mode === "view"
        ? "View Restaurant"
        : mode === "edit"
          ? "Edit Restaurant"
          : "Create Restaurant",
    subtitle:
      mode === "view"
        ? "Restaurant details (read-only)."
        : "Add restaurant and login account for this project.",
    mode,
    stickyFooter: true,
    submitLabel: mode === "edit" ? "Update Restaurant" : "Create Restaurant",
    cancelLabel: "Back",
    tabs: [
      { id: "restaurant", label: "Restaurant Details" },
      { id: "login", label: "Login Details" },
    ],
    initialData,
    sections: [
      {
        title: "Restaurant Details",
        tab: "restaurant",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: restaurantDetailFields(readOnly),
      },
      {
        title: "Login Details",
        tab: "login",
        gridCols: "grid-cols-1 md:grid-cols-2",
        fields: loginDetailFields(readOnly, mode),
      },
    ],
  };
}
