import type { Profile } from "@/lib/profile-store";
import { type Payment, formatDate, formatDateTime, formatInr } from "@/lib/payment-store";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export type InvoiceItem = { description: string; detail: string; qty: number; amount: number };

export type Invoice = {
  number: string;
  date: string;
  paidAt: string;
  billTo: { name: string; company: string; address: string; gstin?: string };
  items: InvoiceItem[];
  subtotal: number;
  gst: number;
  total: number;
  method: string;
  transactionId: string;
  type: string;
};

const isEvent = (p: Payment) => p.planName === "Event Ticket";

/** Builds the invoice view-model from a payment; GST is whatever `total` adds over the pre-tax `base`. */
export function buildInvoice(p: Payment, profile: Profile): Invoice {
  const year = new Date(p.at).getFullYear();
  const address = [profile.bizAddress, profile.bizCity, profile.bizState].filter(Boolean).join(", ");
  return {
    number: `ABLN-${year}-${p.id.slice(-4)}`,
    date: formatDate(p.at),
    paidAt: formatDateTime(p.at),
    billTo: { name: profile.name, company: profile.company, address: `${address}, ${profile.country}` },
    items: [{ description: isEvent(p) ? p.planName : `ABLN ${p.planName}`, detail: isEvent(p) ? p.duration : `${p.duration} Membership Plan`, qty: 1, amount: p.base }],
    subtotal: p.base,
    gst: p.total - p.base,
    total: p.total,
    method: p.method,
    transactionId: p.id,
    type: isEvent(p) ? "Event Ticket" : "Membership Fee",
  };
}

export const gstLabel = (inv: Invoice) => (inv.gst > 0 ? `GST (${Math.round((inv.gst / inv.subtotal) * 100)}%)` : "GST");

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function invoiceHtml(inv: Invoice): string {
  const rows = inv.items
    .map(
      (it, i) =>
        `<tr><td>${i + 1}</td><td><b>${esc(it.description)}</b><br><small>${esc(it.detail)}</small></td><td class="r">${it.qty}</td><td class="r">${formatInr(it.amount)}</td></tr>`,
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@page{margin:24px}
body{font-family:Helvetica,Arial,sans-serif;color:#061B33;margin:0;font-size:13px}
.banner{background:#061B33;color:#fff;padding:24px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:5px solid #D4A72C}
.logo{color:#D4A72C;font-size:34px;font-weight:800}
h1{margin:0;font-size:26px}
.meta{display:flex;justify-content:space-between;margin:22px 0}
small,.muted{color:#64748B}
table{width:100%;border-collapse:collapse}
th{background:#F1F4F9;text-align:left;padding:8px}
td{padding:10px 8px;border-bottom:1px solid #E5EAF1}
.r{text-align:right}
.totals{margin-left:auto;width:50%;margin-top:12px}
.totals div{display:flex;justify-content:space-between;padding:4px 0}
.total{background:#FDF0D2;padding:10px!important;font-size:16px;font-weight:700}
.note{background:#EEF3FA;padding:12px;border-radius:8px;margin-top:20px}
.foot{background:#061B33;color:#fff;padding:14px 24px;margin-top:24px;display:flex;justify-content:space-between;border-top:5px solid #D4A72C}
</style></head><body>
<div class="banner"><div><div class="logo">ABLN</div>Agarwal Business Leaders Network</div><div style="text-align:right"><h1>INVOICE</h1>#${esc(inv.number)}</div></div>
<div class="meta"><div><span class="muted">Bill To</span><br><b>${esc(inv.billTo.name)}</b><br>${esc(inv.billTo.company)}<br><span class="muted">${esc(inv.billTo.address)}</span></div>
<div style="text-align:right"><span class="muted">Invoice Date</span><br><b>${inv.date}</b></div></div>
<table><tr><th>#</th><th>Description</th><th class="r">Qty</th><th class="r">Amount</th></tr>${rows}</table>
<div class="totals"><div><span>Subtotal</span><span>${formatInr(inv.subtotal)}</span></div>
<div><span>${gstLabel(inv)}</span><span>${formatInr(inv.gst)}</span></div>
<div class="total"><span>Total Amount</span><span>${formatInr(inv.total)}</span></div></div>
<div class="note"><b>Notes</b><br>Thank you for being a valued member of Agarwal Business Leaders Network (ABLN). This is a system generated invoice.</div>
<div class="foot"><span>Building Businesses<br>Strengthening Communities</span><span>www.abln.in</span></div>
</body></html>`;
}

/** Renders the invoice to a PDF and opens the share sheet (used for both Download PDF and Share Invoice). */
export async function shareInvoicePdf(inv: Invoice) {
  const { uri } = await Print.printToFileAsync({ html: invoiceHtml(inv) });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf", dialogTitle: `Invoice ${inv.number}` });
  }
}
