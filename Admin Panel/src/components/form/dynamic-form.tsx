"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type {
  DynamicFormConfig,
  DynamicFormField,
} from "@/types/dynamic-form.types";
import { ApiSelect } from "@/components/form/ApiSelect";
import { InputSidebar } from "@/components/form/InputSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatDateDisplayIST } from "@/utils/format-date";

interface DynamicFormProps {
  config: DynamicFormConfig;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  onEdit?: () => void;
  loading?: boolean;
}

function fieldVisible(
  field: DynamicFormField,
  formData: Record<string, unknown>
) {
  return field.condition ? field.condition(formData) : true;
}

function sectionTab(section: { tab?: string }) {
  return section.tab;
}

function resolveLinkedLabel(
  field: DynamicFormField,
  formData: Record<string, unknown>
): string | null {
  if (field.cacheFieldName) {
    const cached = formData[field.cacheFieldName];
    if (cached != null && String(cached).trim() !== "") {
      return String(cached);
    }
  }
  const resolved = field.viewDisplayResolver?.(formData);
  if (resolved != null && String(resolved).trim() !== "") {
    return String(resolved);
  }
  return null;
}

function formatDisplayValue(
  field: DynamicFormField,
  value: unknown,
  formData: Record<string, unknown> = {}
): string {
  if (field.type === "api-select" || field.type === "input-sidebar") {
    const linked = resolveLinkedLabel(field, formData);
    if (linked) return linked;
    if (field.multiSelect && Array.isArray(value) && value.length) {
      return value.join(", ");
    }
    if (value === null || value === undefined || value === "") return "—";
    if (Array.isArray(value) && !value.length) return "—";
    return "—";
  }

  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "multiselect" && Array.isArray(value)) {
    if (!value.length) return "—";
    return value
      .map((v) => {
        const opt = field.options?.find((o) => o.value === String(v));
        return opt?.label ?? String(v);
      })
      .join(", ");
  }
  if (field.type === "select" && field.options?.length) {
    const opt = field.options.find((o) => o.value === String(value));
    return opt?.label ?? String(value);
  }
  if (field.type === "checkbox") return value ? "Yes" : "No";
  if (field.type === "date" && value) {
    const formatted = formatDateDisplayIST(String(value));
    if (formatted) return formatted;
  }
  if (field.type === "number" && value !== "" && value != null) {
    return String(value);
  }
  return String(value);
}

export function DynamicForm({
  config,
  onSubmit,
  onCancel,
  onEdit,
  loading = false,
}: DynamicFormProps) {
  const router = useRouter();
  const isView = config.mode === "view";
  const hasTabs = Boolean(config.tabs?.length);
  const defaultTab = config.tabs?.[0]?.id ?? "";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [formData, setFormData] = useState<Record<string, unknown>>(
    config.initialData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(config.initialData);
    setErrors({});
    setActiveTab(config.tabs?.[0]?.id ?? "");
  }, [config.initialData, config.tabs]);

  const updateField = useCallback((name: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const mergeFormPatch = useCallback((patch: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const fieldToTab = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of config.sections) {
      const tab = sectionTab(section);
      if (!tab) continue;
      for (const field of section.fields) {
        map.set(field.name, tab);
      }
    }
    return map;
  }, [config.sections]);

  const validate = useCallback(() => {
    const next: Record<string, string> = {};
    for (const section of config.sections) {
      for (const field of section.fields) {
        if (!fieldVisible(field, formData)) continue;
        const value = formData[field.name];
        if (field.required) {
          const empty =
            value === null ||
            value === undefined ||
            (typeof value === "string" && !value.trim()) ||
            (field.type === "multiselect" &&
              (!Array.isArray(value) || value.length === 0)) ||
            (field.type === "checkbox" && value !== true);
          if (empty) {
            next[field.name] = `${field.label} is required`;
            continue;
          }
        }
        if (field.validate) {
          const result = field.validate(value, formData);
          if (result !== true) {
            next[field.name] = result;
          }
        }
      }
    }
    setErrors(next);

    if (Object.keys(next).length > 0 && hasTabs) {
      const firstField = Object.keys(next)[0];
      const tab = fieldToTab.get(firstField);
      if (tab) setActiveTab(tab);
    }

    return Object.keys(next).length === 0;
  }, [config.sections, fieldToTab, formData, hasTabs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isView) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = onCancel ?? (() => router.back());

  const renderViewField = (field: DynamicFormField, value: unknown) => {
    const linked = resolveLinkedLabel(field, formData);
    const display =
      linked ?? formatDisplayValue(field, value, formData);
    return (
      <div
        key={field.name}
        className={cn(
          "rounded-lg border border-border/60 bg-muted/40 px-3.5 py-3 dark:border-primary/15 dark:bg-primary/8",
          field.fullWidth && "md:col-span-2"
        )}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {field.label}
        </p>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground wrap-break-word whitespace-pre-wrap">
          {display}
        </p>
      </div>
    );
  };

  const renderField = (field: DynamicFormField) => {
    if (!fieldVisible(field, formData)) return null;

    const value = formData[field.name];
    const error = errors[field.name];
    const disabled = isView || field.readOnly || loading || submitting;
    const id = `field-${field.name}`;

    if (isView) {
      return renderViewField(field, value);
    }

    const control = (() => {
      switch (field.type) {
        case "textarea":
          return (
            <textarea
              id={id}
              rows={field.rows ?? 3}
              disabled={disabled}
              placeholder={field.placeholder}
              value={String(value ?? "")}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            />
          );
        case "checkbox":
          return (
            <div
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg border border-input/80 bg-background px-3 shadow-sm",
                disabled && "opacity-50"
              )}
            >
              <input
                id={id}
                type="checkbox"
                disabled={disabled}
                checked={Boolean(value)}
                onChange={(e) => updateField(field.name, e.target.checked)}
                className="size-4 shrink-0 rounded border-input accent-primary"
              />
              <label
                htmlFor={id}
                className="cursor-pointer text-sm font-medium leading-none"
              >
                {field.label}
                {field.required && (
                  <span className="text-destructive"> *</span>
                )}
              </label>
            </div>
          );
        case "date":
          return (
            <Input
              id={id}
              type="date"
              disabled={disabled}
              placeholder={field.placeholder}
              value={String(value ?? "").slice(0, 10)}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="h-10 border-input/80 bg-background shadow-sm"
            />
          );
        case "number":
          return (
            <Input
              id={id}
              type="number"
              disabled={disabled}
              placeholder={field.placeholder}
              value={
                value === null || value === undefined ? "" : String(value)
              }
              onChange={(e) =>
                updateField(
                  field.name,
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="h-10 border-input/80 bg-background shadow-sm"
            />
          );
        case "select":
          return (
            <select
              id={id}
              disabled={disabled}
              value={String(value ?? "")}
              onChange={(e) => updateField(field.name, e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="">{field.placeholder ?? "Select..."}</option>
              {(field.options ?? []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        case "api-select":
          if (!field.apiObject || !field.selectedDataKey) return null;
          return (
            <ApiSelect
              id={id}
              required={field.required}
              placeholder={field.placeholder}
              disabled={disabled}
              apiObject={field.apiObject}
              selectedDataKey={field.selectedDataKey}
              isWholeObject={field.isWholeObject}
              displayedData={field.displayedData}
              displayText={
                field.cacheFieldName
                  ? String(formData[field.cacheFieldName] ?? "")
                  : undefined
              }
              showIdInList={false}
              value={value}
              onChange={(v) => updateField(field.name, v)}
              onRowSelect={(row) => {
                if (!field.cacheFieldName || !field.selectedDataKey) return;
                if (!row || Object.keys(row).length === 0) {
                  mergeFormPatch({ [field.cacheFieldName]: "" });
                  return;
                }
                const key =
                  field.displayedData || field.selectedDataKey.label;
                mergeFormPatch({
                  [field.cacheFieldName]: row[key] ?? "",
                });
              }}
            />
          );
        case "input-sidebar":
          if (!field.apiObject || !field.selectedData) return null;
          return (
            <InputSidebar
              id={id}
              required={field.required}
              placeholder={field.placeholder}
              disabled={disabled}
              apiObject={field.apiObject}
              selectedData={field.selectedData}
              displayedData={field.displayedData ?? field.selectedData}
              displayFields={field.displayFields}
              customColumnDefs={field.customColumnDefs}
              rowValueKey={field.rowValueKey}
              multiSelect={field.multiSelect}
              isWholeObject={field.isWholeObject}
              value={value}
              displayText={
                field.cacheFieldName
                  ? String(formData[field.cacheFieldName] ?? "")
                  : field.viewDisplayResolver?.(formData) ?? ""
              }
              sheetTitle={field.label}
              cacheFieldName={field.cacheFieldName}
              onChange={mergeFormPatch}
            />
          );
        case "multiselect": {
          const selected = Array.isArray(value)
            ? (value as string[])
            : [];
          return (
            <div
              id={id}
              className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-input p-3"
            >
              {(field.options ?? []).map((opt) => {
                const checked = selected.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      disabled={disabled}
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selected, opt.value]
                          : selected.filter((v) => v !== opt.value);
                        updateField(field.name, next);
                      }}
                      className="size-4 rounded border-input accent-primary"
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
              {!field.options?.length && (
                <p className="text-sm text-muted-foreground">No options</p>
              )}
            </div>
          );
        }
        default:
          return (
            <Input
              id={id}
              type={field.type === "password" ? "password" : "text"}
              disabled={disabled}
              placeholder={field.placeholder}
              value={
                value === null || value === undefined ? "" : String(value)
              }
              onChange={(e) => updateField(field.name, e.target.value)}
              className="h-10 border-input/80 bg-background shadow-sm"
            />
          );
      }
    })();

    if (field.type === "checkbox") {
      return (
        <div
          key={field.name}
          className={cn(
            field.fullWidth && "md:col-span-2",
            !isView &&
              "rounded-xl border border-border/40 bg-gradient-to-b from-muted/25 to-transparent px-3.5 py-3.5 dark:from-muted/15"
          )}
        >
          {control}
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
      );
    }

    return (
      <div
        key={field.name}
        className={cn(
          "flex flex-col gap-2",
          field.fullWidth && "md:col-span-2",
          !isView &&
            "rounded-xl border border-border/40 bg-gradient-to-b from-muted/25 to-transparent px-3.5 py-3.5 dark:from-muted/15"
        )}
      >
        <Label htmlFor={id} className="text-sm font-medium tracking-tight">
          {field.label}
          {field.required && !isView && (
            <span className="text-destructive"> *</span>
          )}
        </Label>
        {control}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  };

  const showTabBar = hasTabs && !isView;
  const showSectionTitle = isView || !hasTabs;

  const visibleSections = useMemo(() => {
    if (isView || !hasTabs) return config.sections;
    return config.sections.filter((s) => sectionTab(s) === activeTab);
  }, [activeTab, config.sections, hasTabs, isView]);

  const footerButtons = useMemo(() => {
    if (isView) {
      return (
        <>
          <Button type="button" variant="outline" onClick={handleCancel}>
            {config.cancelLabel ?? "Back"}
          </Button>
          {onEdit && (
            <Button type="button" onClick={onEdit}>
              Edit
            </Button>
          )}
        </>
      );
    }
    return (
      <>
        <Button
          type="button"
          variant="outline"
          disabled={submitting || loading}
          onClick={handleCancel}
        >
          {config.cancelLabel ?? "Back"}
        </Button>
        <Button type="submit" disabled={submitting || loading}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {config.submitLabel ?? "Save"}
        </Button>
      </>
    );
  }, [config, handleCancel, isView, loading, onEdit, submitting]);

  const pinnedLayout = isView || config.stickyFooter !== false;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col",
        pinnedLayout &&
          "h-[calc(100svh-3.5rem-3rem)] max-h-[calc(100svh-3.5rem-3rem)]"
      )}
    >
      <div className={cn(pinnedLayout && "min-h-0 flex-1 overflow-y-auto")}>
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {config.title}
          </h1>
          {config.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {config.subtitle}
            </p>
          )}
        </div>

        {showTabBar && config.tabs && (
          <div
            className="mb-4 flex flex-wrap gap-1 rounded-lg border border-border bg-muted/40 p-1"
            role="tablist"
            aria-label="Form sections"
          >
            {config.tabs.map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`tabpanel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(e) => {
                    const tabs = config.tabs ?? [];
                    const idx = tabs.findIndex((t) => t.id === tab.id);
                    if (e.key === "ArrowRight" && idx < tabs.length - 1) {
                      e.preventDefault();
                      setActiveTab(tabs[idx + 1].id);
                    }
                    if (e.key === "ArrowLeft" && idx > 0) {
                      e.preventDefault();
                      setActiveTab(tabs[idx - 1].id);
                    }
                  }}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            {visibleSections.map((section) => {
              const tabId = sectionTab(section);
              return (
                <section
                  key={section.title}
                  id={tabId ? `tabpanel-${tabId}` : undefined}
                  role={tabId ? "tabpanel" : undefined}
                  aria-labelledby={tabId ? `tab-${tabId}` : undefined}
                  tabIndex={tabId ? 0 : undefined}
                  className="rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm ring-1 ring-border/40 backdrop-blur-sm"
                >
                  {showSectionTitle && (
                    <h2 className="mb-4 border-b border-border/60 pb-3 font-heading text-base font-semibold text-foreground">
                      {section.title}
                    </h2>
                  )}
                  <div
                    className={cn(
                      "grid gap-4",
                      section.gridCols ?? "grid-cols-1 md:grid-cols-2"
                    )}
                  >
                    {section.fields.map(renderField)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {!loading && (
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-card px-2 py-4",
            pinnedLayout &&
              "shadow-[0_-4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.35)]"
          )}
        >
          {footerButtons}
        </div>
      )}
    </form>
  );
}
