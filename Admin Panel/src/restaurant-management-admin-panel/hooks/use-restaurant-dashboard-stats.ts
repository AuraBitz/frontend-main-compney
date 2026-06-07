"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toIsoDateInput } from "@/lib/dashboard-utils";
import { restaurantListQuery } from "@/restaurant-management-admin-panel/lib/restaurant-portal-scope";
import { GetAllRestaurantBookingsList } from "@/services/api/restaurant-booking-master.api";
import { GetAllRestaurantCustomersList } from "@/services/api/restaurant-customer-management.api";
import { GetAllRestaurantTablesList } from "@/services/api/restaurant-table-master.api";
import type { RestaurantBookingRow, RestaurantTableRow } from "@/types/restaurant-ops.types";
import type { SessionUser } from "@/types/auth.types";
import type { ProjectPortalSession } from "@/store/project-portal";

export interface RestaurantDashboardStats {
  loading: boolean;
  bookings: RestaurantBookingRow[];
  tables: RestaurantTableRow[];
  customerTotal: number;
  bookingStatus: { label: string; count: number; color: string }[];
  tableStats: {
    available: number;
    reserved: number;
    booked: number;
    total: number;
  };
  todayBookings: number;
  activeBookings: number;
  manualBookings: number;
}

const EMPTY_STATS: RestaurantDashboardStats = {
  loading: true,
  bookings: [],
  tables: [],
  customerTotal: 0,
  bookingStatus: [],
  tableStats: { available: 0, reserved: 0, booked: 0, total: 0 },
  todayBookings: 0,
  activeBookings: 0,
  manualBookings: 0,
};

function summarizeTableStats(tables: RestaurantTableRow[]) {
  let available = 0;
  let reserved = 0;
  let booked = 0;

  for (const table of tables) {
    const status = (table.booking_status ?? "available").toLowerCase();
    if (status === "reserved") reserved += 1;
    else if (status === "occupied" || status === "busy" || status === "booked") {
      booked += 1;
    } else {
      available += 1;
    }
  }

  return {
    available,
    reserved,
    booked,
    total: tables.length,
  };
}

function summarizeBookingStatus(bookings: RestaurantBookingRow[]) {
  const counts = {
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  };

  for (const booking of bookings) {
    const status = (booking.booking_status ?? "pending").toLowerCase();
    if (status in counts) {
      counts[status as keyof typeof counts] += 1;
    }
  }

  return [
    { label: "Pending", count: counts.pending, color: "bg-amber-500" },
    { label: "Confirmed", count: counts.confirmed, color: "bg-emerald-500" },
    { label: "Completed", count: counts.completed, color: "bg-sky-500" },
    { label: "Cancelled", count: counts.cancelled, color: "bg-rose-500/80" },
  ];
}

export function useRestaurantDashboardStats(
  session: ProjectPortalSession | null,
  user: SessionUser | null
): RestaurantDashboardStats {
  const [stats, setStats] = useState<RestaurantDashboardStats>(EMPTY_STATS);

  const load = useCallback(async () => {
    if (!session) {
      setStats({ ...EMPTY_STATS, loading: false });
      return;
    }

    setStats((prev) => ({ ...prev, loading: true }));
    const query = restaurantListQuery(session, user);

    try {
      const [bookingsRes, tablesRes, customersRes] = await Promise.all([
        GetAllRestaurantBookingsList({ ...query, skip: 0, limit: 500 }),
        GetAllRestaurantTablesList({ ...query, skip: 0, limit: 500 }),
        GetAllRestaurantCustomersList({ ...query, skip: 0, limit: 1 }),
      ]);

      const bookings = bookingsRes.rows ?? [];
      const tables = tablesRes.rows ?? [];
      const today = toIsoDateInput(new Date());

      const todayBookings = bookings.filter((booking) => {
        const date = booking.booking_date
          ? String(booking.booking_date).slice(0, 10)
          : "";
        return date === today;
      }).length;

      const activeBookings = bookings.filter((booking) => {
        const status = (booking.booking_status ?? "").toLowerCase();
        return status === "pending" || status === "confirmed";
      }).length;

      const manualBookings = bookings.filter(
        (booking) => booking.is_manual_booking === true
      ).length;

      setStats({
        loading: false,
        bookings,
        tables,
        customerTotal: customersRes.total ?? customersRes.rows?.length ?? 0,
        bookingStatus: summarizeBookingStatus(bookings),
        tableStats: summarizeTableStats(tables),
        todayBookings,
        activeBookings,
        manualBookings,
      });
    } catch {
      setStats({ ...EMPTY_STATS, loading: false });
    }
  }, [session, user]);

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(() => stats, [stats]);
}
