"use client";

import { useEffect, useMemo, useState } from "react";
import { QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildCustomerScanUrl } from "@/restaurant-management-admin-panel/lib/customer-scan-url";
import type { RestaurantBookingRow } from "@/types/restaurant-ops.types";

interface BookingQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: RestaurantBookingRow | null;
}

export function BookingQrDialog({
  open,
  onOpenChange,
  booking,
}: BookingQrDialogProps) {
  const [error, setError] = useState("");
  const [scanUrl, setScanUrl] = useState("");

  useEffect(() => {
    if (!open || !booking) {
      setScanUrl("");
      setError("");
      return;
    }

    if (!booking.table_id) {
      setError("This booking has no table assigned. Assign a table first.");
      setScanUrl("");
      return;
    }

    if (!booking.customer_id) {
      setError("This booking has no customer linked. Link a customer first.");
      setScanUrl("");
      return;
    }

    if (booking.booking_status === "cancelled") {
      setError("Cancelled bookings cannot generate a QR code.");
      setScanUrl("");
      return;
    }

    setError("");
    setScanUrl(
      buildCustomerScanUrl({
        restaurantId: booking.restaurant_id,
        customerId: booking.customer_id,
        tableId: booking.table_id,
        bookingId: booking.id,
      })
    );
  }, [open, booking]);

  const customerLabel = useMemo(
    () => booking?.customer_name?.trim() || "Guest",
    [booking?.customer_name]
  );

  const tableLabel = useMemo(
    () => booking?.table_number?.trim() || (booking?.table_id ? `Table #${booking.table_id}` : "—"),
    [booking?.table_id, booking?.table_number]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-md"
        overlayClassName="bg-black/50 backdrop-blur-md"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5" />
            Booking QR Code
          </DialogTitle>
          <DialogDescription>
            Scan to open the customer website for {customerLabel} at {tableLabel}.
            The guest will land directly on their table session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
              {error}
            </p>
          ) : scanUrl ? (
            <>
              <div className="rounded-2xl border bg-white p-4 shadow-inner">
                <QRCodeSVG value={scanUrl} size={220} level="M" includeMargin />
              </div>
              <p className="max-w-full break-all text-center text-xs text-muted-foreground">
                {scanUrl}
              </p>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
