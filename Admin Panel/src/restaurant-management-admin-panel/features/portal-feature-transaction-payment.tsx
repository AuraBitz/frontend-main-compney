"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listQueryForRestaurant } from "@/restaurant-management-admin-panel/lib/project-filters";
import { GetAllRestaurantCustomersList } from "@/services/api/restaurant-customer-management.api";
import { GetAllRestaurantOrdersList } from "@/services/api/restaurant-order-management.api";
import {
  CreateRestaurantTransaction,
  GetRestaurantTransactionById,
  UpdateRestaurantTransaction,
} from "@/services/api/restaurant-transaction-master.api";
import {
  CreateRestaurantPayment,
  GetRestaurantPaymentById,
  UpdateRestaurantPayment,
} from "@/services/api/restaurant-payment-master.api";
import { GetAllRestaurantTransactionsList } from "@/services/api/restaurant-transaction-master.api";
import type {
  RestaurantCustomerRow,
  RestaurantOrderRow,
  RestaurantTransactionRow,
} from "@/types/restaurant-ops.types";
import { formatDateDDMMYYYY } from "@/utils/format-date";

interface PortalFormProps {
  mode: "create" | "edit" | "view";
  restaurantId: number;
  recordId?: string;
  onDone?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
}

export function PortalTransactionForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalFormProps) {
  const [loading, setLoading] = useState(mode !== "create");
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<RestaurantCustomerRow[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [transactionAt, setTransactionAt] = useState("");
  const [transactionBy, setTransactionBy] = useState("");
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  useEffect(() => {
    let cancelled = false;
    GetAllRestaurantCustomersList(listQueryForRestaurant(restaurantId))
      .then((result) => {
        if (!cancelled) setCustomers(result.rows);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load customers");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (mode === "create" || !recordId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    GetRestaurantTransactionById(recordId)
      .then((row) => {
        if (cancelled) return;
        setCustomerId(row.customer_id ? String(row.customer_id) : "");
        setAccountNumber(row.account_number ?? "");
        setBankName(row.bank_name ?? "");
        setTransactionAt(
          row.transaction_at ? String(row.transaction_at).slice(0, 10) : ""
        );
        setTransactionBy(row.transaction_by ?? "");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load transaction");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, recordId]);

  const handleSubmit = useCallback(async () => {
    if (readOnly) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        customer_id: Number(customerId),
        account_number: accountNumber.trim() || null,
        bank_name: bankName.trim() || null,
        transaction_at: transactionAt || null,
        transaction_by: transactionBy.trim() || null,
      };
      if (mode === "create") {
        await CreateRestaurantTransaction(payload);
      } else if (recordId) {
        await UpdateRestaurantTransaction(recordId, payload);
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }, [
    readOnly,
    customerId,
    accountNumber,
    bankName,
    transactionAt,
    transactionBy,
    mode,
    recordId,
    onDone,
  ]);

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="txn-customer">Customer</Label>
          {readOnly ? (
            <p className="text-sm font-medium">
              {customers.find((c) => String(c.id) === customerId)?.customer_name ||
                "—"}
            </p>
          ) : (
            <select
              id="txn-customer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_name}
                  {c.phone ? ` (${c.phone})` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="txn-account">Account number</Label>
          {readOnly ? (
            <p className="text-sm font-medium">{accountNumber || "—"}</p>
          ) : (
            <Input
              id="txn-account"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="txn-bank">Bank name</Label>
          {readOnly ? (
            <p className="text-sm font-medium">{bankName || "—"}</p>
          ) : (
            <Input
              id="txn-bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="txn-at">Transaction date</Label>
          {readOnly ? (
            <p className="text-sm font-medium">
              {transactionAt ? formatDateDDMMYYYY(transactionAt) : "—"}
            </p>
          ) : (
            <Input
              id="txn-at"
              type="date"
              value={transactionAt}
              onChange={(e) => setTransactionAt(e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="txn-by">Transaction by</Label>
          {readOnly ? (
            <p className="text-sm font-medium">{transactionBy || "—"}</p>
          ) : (
            <Input
              id="txn-by"
              value={transactionBy}
              onChange={(e) => setTransactionBy(e.target.value)}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {readOnly ? (
          <>
            {onEdit ? (
              <Button type="button" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
          </>
        ) : (
          <>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "create" ? (
                "Create"
              ) : (
                "Save"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function PortalPaymentForm({
  mode,
  restaurantId,
  recordId,
  onDone,
  onCancel,
  onEdit,
}: PortalFormProps) {
  const [loading, setLoading] = useState(mode !== "create");
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState<RestaurantOrderRow[]>([]);
  const [transactions, setTransactions] = useState<RestaurantTransactionRow[]>(
    []
  );
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isCashAmount, setIsCashAmount] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentAt, setPaymentAt] = useState("");
  const [error, setError] = useState("");
  const readOnly = mode === "view";

  useEffect(() => {
    let cancelled = false;
    const query = listQueryForRestaurant(restaurantId);
    Promise.all([
      GetAllRestaurantOrdersList(query),
      GetAllRestaurantTransactionsList(query),
    ])
      .then(([orderResult, txnResult]) => {
        if (!cancelled) {
          setOrders(orderResult.rows);
          setTransactions(txnResult.rows);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load options");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  useEffect(() => {
    if (mode === "create" || !recordId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    GetRestaurantPaymentById(recordId)
      .then((row) => {
        if (cancelled) return;
        setOrderId(String(row.order_id));
        setTransactionId(row.transaction_id ? String(row.transaction_id) : "");
        setIsCashAmount(Boolean(row.is_cash_amount));
        setAmount(String(row.amount ?? ""));
        setPaymentAt(row.payment_at ? String(row.payment_at).slice(0, 10) : "");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load payment");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, recordId]);

  const handleSubmit = useCallback(async () => {
    if (readOnly) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        order_id: Number(orderId),
        transaction_id: transactionId ? Number(transactionId) : null,
        is_cash_amount: isCashAmount,
        amount: Number(amount) || 0,
        payment_at: paymentAt || null,
      };
      if (mode === "create") {
        await CreateRestaurantPayment(payload);
      } else if (recordId) {
        await UpdateRestaurantPayment(recordId, payload);
      }
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }, [
    readOnly,
    orderId,
    transactionId,
    isCashAmount,
    amount,
    paymentAt,
    mode,
    recordId,
    onDone,
  ]);

  if (loading) {
    return <Loader2 className="size-5 animate-spin text-muted-foreground" />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pay-order">Order</Label>
          {readOnly ? (
            <p className="text-sm font-medium">
              {orders.find((o) => String(o.id) === orderId)
                ? `Order #${orderId}`
                : orderId || "—"}
            </p>
          ) : (
            <select
              id="pay-order"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              disabled={mode === "edit"}
            >
              <option value="">Select order</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.id}
                  {o.table_number ? ` · Table ${o.table_number}` : ""} · ₹{o.amount}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-txn">Transaction</Label>
          {readOnly ? (
            <p className="text-sm font-medium">
              {transactionId ? `Transaction #${transactionId}` : "—"}
            </p>
          ) : (
            <select
              id="pay-txn"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            >
              <option value="">None (cash only)</option>
              {transactions.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} · {t.customer_name || "Customer"}
                  {t.bank_name ? ` · ${t.bank_name}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            id="pay-cash"
            type="checkbox"
            checked={isCashAmount}
            onChange={(e) => setIsCashAmount(e.target.checked)}
            disabled={readOnly}
            className="size-4 rounded border-input"
          />
          <Label htmlFor="pay-cash">Cash payment</Label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-amount">Amount</Label>
          {readOnly ? (
            <p className="text-sm font-medium">{amount || "—"}</p>
          ) : (
            <Input
              id="pay-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pay-at">Payment date</Label>
          {readOnly ? (
            <p className="text-sm font-medium">
              {paymentAt ? formatDateDDMMYYYY(paymentAt) : "—"}
            </p>
          ) : (
            <Input
              id="pay-at"
              type="date"
              value={paymentAt}
              onChange={(e) => setPaymentAt(e.target.value)}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {readOnly ? (
          <>
            {onEdit ? (
              <Button type="button" onClick={onEdit}>
                Edit
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onCancel}>
              Back
            </Button>
          </>
        ) : (
          <>
            <Button type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "create" ? (
                "Create"
              ) : (
                "Save"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
