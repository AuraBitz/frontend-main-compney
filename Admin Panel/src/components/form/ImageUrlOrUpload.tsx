"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_BYTES = 2 * 1024 * 1024;

interface ImageUrlOrUploadProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hint?: string;
}

export function ImageUrlOrUpload({
  label = "Image",
  value,
  onChange,
  disabled = false,
  hint,
}: ImageUrlOrUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file || disabled) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > MAX_BYTES) {
      alert("Image must be 2MB or smaller.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <Input
          value={value}
          placeholder="https://... or upload below"
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-w-[200px] flex-1"
        />
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          Upload
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange("")}
          >
            Clear
          </Button>
        ) : null}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {value?.trim() ? (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="max-h-40 w-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
