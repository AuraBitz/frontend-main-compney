"use client";

import { useCallback, useState } from "react";
import { Upload, FileUp } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload: (fileName: string) => Promise<void>;
  disabled?: boolean;
}

export function UploadZone({ onUpload, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || disabled) return;

      setIsUploading(true);
      try {
        for (const file of Array.from(files)) {
          await onUpload(file.name);
        }
        toast.success(
          files.length === 1
            ? `"${files[0].name}" uploaded (mock)`
            : `${files.length} files uploaded (mock)`
        );
      } catch {
        toast.error("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [disabled, onUpload]
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragging && !disabled
          ? "border-primary bg-primary/5"
          : "border-border bg-secondary/30",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
        {isUploading ? (
          <FileUp className="h-5 w-5 animate-pulse text-primary" />
        ) : (
          <Upload className="h-5 w-5 text-primary" />
        )}
      </div>
      <p className="mt-2 text-sm font-medium">
        {isUploading ? "Uploading..." : "Drop files here or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Mock upload — files appear in the current folder
      </p>
      <label className="mt-3">
        <input
          type="file"
          multiple
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span
          className={cn(
            "inline-flex cursor-pointer items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90",
            (disabled || isUploading) && "pointer-events-none opacity-50"
          )}
        >
          Browse Files
        </span>
      </label>
    </div>
  );
}
