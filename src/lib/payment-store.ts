import { useSyncExternalStore } from "react";

export type PaymentStatus = "Successful" | "Pending" | "Failed";
export type PaymentMethod = "UPI" | "UPI (Google Pay)" | "Credit / Debit Card" | "Net Banking" | "Wallet";

export type Payment = {
  id: string;
  planName: string;
  duration: string;
  // Pre-tax plan price; `total` includes GST.
  base: number;
  total: number;
  method: PaymentMethod;
  status: PaymentStatus;
  at: number;
  reason?: string;
};

const at = (y: number, m: number, d: number, h = 9, min = 45) => new Date(y, m - 1, d, h, min).getTime();

// Sample history until the payments API is wired up.
let payments: Payment[] = [
  { id: "ABLN202610120945", planName: "Premium Member", duration: "1 Year", base: 9999, total: 11798, method: "UPI (Google Pay)", status: "Successful", at: at(2026, 10, 12) },
  { id: "ABLN202609101130", planName: "Regular Member", duration: "1 Year", base: 4999, total: 5899, method: "Credit / Debit Card", status: "Pending", at: at(2026, 9, 10, 11, 30) },
  { id: "ABLN202609050915", planName: "Premium Member", duration: "1 Year", base: 9999, total: 11798, method: "Net Banking", status: "Failed", at: at(2026, 9, 5, 9, 15), reason: "Payment was declined by your bank." },
  { id: "ABLN202510120946", planName: "Premium Member", duration: "1 Year", base: 9999, total: 11798, method: "UPI (Google Pay)", status: "Successful", at: at(2025, 10, 12, 9, 46) },
  { id: "ABLN202508201800", planName: "Event Ticket", duration: "Diwali Networking Meet", base: 1500, total: 1500, method: "UPI (Google Pay)", status: "Successful", at: at(2025, 8, 20, 18, 0) },
];
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const usePayments = () => useSyncExternalStore(subscribe, () => payments);

export const usePayment = (id?: string) => usePayments().find((p) => p.id === id);

const pad = (n: number) => String(n).padStart(2, "0");

export function createPayment(input: Pick<Payment, "planName" | "duration" | "base" | "total" | "method">): Payment {
  const d = new Date();
  let id = `ABLN${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  while (payments.some((p) => p.id === id)) id += "0";
  const payment: Payment = { id, status: "Pending", at: d.getTime(), ...input };
  payments = [payment, ...payments];
  emit();
  return payment;
}

export function updatePayment(id: string, patch: Partial<Pick<Payment, "status" | "reason" | "at">>) {
  payments = payments.map((p) => (p.id === id ? { ...p, ...patch } : p));
  emit();
}

export const formatInr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const formatDate = (ms: number) => new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export const formatDateTime = (ms: number) => {
  const t = new Date(ms).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${formatDate(ms)}, ${t}`;
};

export const receiptText = (p: Payment) =>
  [
    "ABLN Payment Receipt",
    `Transaction ID: ${p.id}`,
    `Plan: ${p.planName} (${p.duration})`,
    `Amount Paid: ${formatInr(p.total)}`,
    `Payment Method: ${p.method}`,
    `Date: ${formatDateTime(p.at)}`,
    `Status: ${p.status}`,
  ].join("\n");
