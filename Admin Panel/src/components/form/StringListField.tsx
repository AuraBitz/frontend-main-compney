"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StringListFieldProps {
  id?: string;
  value: unknown;
  disabled?: boolean;
  placeholder?: string;
  onChange: (next: string[]) => void;
}

function normalizeItems(value: unknown): string[] {
  if (!Array.isArray(value) || !value.length) return [""];
  return value.map((entry) => String(entry ?? ""));
}

export function StringListField({
  id,
  value,
  disabled = false,
  placeholder = "Enter feature",
  onChange,
}: StringListFieldProps) {
  const items = normalizeItems(value);

  const updateItem = (index: number, text: string) => {
    const next = [...items];
    next[index] = text;
    onChange(next);
  };

  const addItem = () => {
    onChange([...items, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      onChange([""]);
      return;
    }
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div id={id} className="space-y-2">
      {items.map((item, index) => (
        <div key={`${id ?? "feature"}-${index}`} className="flex items-center gap-2">
          <Input
            disabled={disabled}
            placeholder={placeholder}
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            className="h-10 border-input/80 bg-background shadow-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={() => removeItem(index)}
            aria-label="Remove feature"
            className="shrink-0"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={addItem}
        className="gap-1.5"
      >
        <Plus className="size-4" />
        Add feature
      </Button>
    </div>
  );
}
