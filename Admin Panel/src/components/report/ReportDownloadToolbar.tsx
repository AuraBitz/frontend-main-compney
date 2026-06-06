"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ReportDownloadParams } from "@/lib/download-excel-report";

interface ReportDownloadToolbarProps {
  onDownload: (params: ReportDownloadParams) => Promise<void>;
  className?: string;
}

export function ReportDownloadToolbar({
  onDownload,
  className = "",
}: ReportDownloadToolbarProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (startDate && endDate && startDate > endDate) {
      setError("Start date cannot be after end date.");
      return;
    }
    setError("");
    setDownloading(true);
    try {
      await onDownload({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download report"
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={className}>
      {error && (
        <p className="mb-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="report-start-date">Start Date</Label>
          <Input
            id="report-start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-10 w-40"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="report-end-date">End Date</Label>
          <Input
            id="report-end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-10 w-40"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2"
          disabled={downloading}
          onClick={handleDownload}
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download Report
        </Button>
      </div>
    </div>
  );
}
