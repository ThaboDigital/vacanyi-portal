'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Invoice, Client, Project, MilestoneReceipt } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import { PaymentModal } from '@/components/documents/payment-modal';
import {
  ArrowLeft,
  ReceiptText,
  Share2,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { EmailShareService } from '@/lib/share/email';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | undefined>();
  const [client, setClient] = useState<Client | undefined>();
  const [project, setProject] = useState<Project | undefined>();
  const [receipts, setReceipts] = useState<MilestoneReceipt[]>([]);
  const [settings, setSettings] = useState(DataStore.getSettings());

  // Modals
  const [viewerOpen, setViewerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const refreshData = () => {
    const inv = DataStore.getInvoiceById(invoiceId);
    setInvoice(inv);
    if (inv) {
      setClient(DataStore.getClientById(inv.clientId));
      if (inv.projectId) {
        setProject(DataStore.getProjectById(inv.projectId));
      }
      setReceipts(DataStore.getReceipts().filter((r) => r.invoiceId === inv.id));
    }
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, [invoiceId]);

  if (!invoice) {
    return (
      <PortalShell>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Invoice not found.</p>
          <Link href="/invoices" className="mt-4 inline-block px-4 py-2 bg-[#082B52] text-white rounded-lg text-xs font-bold">
            Back to Invoices
          </Link>
        </div>
      </PortalShell>
    );
  }

  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid';

  const handleWhatsAppShare = () => {
    if (!client) return;
    const message = WhatsAppShareService.createInvoiceMessage(invoice, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, message);
  };

  const handleEmailShare = () => {
    if (!client) return;
    EmailShareService.sendInvoiceEmail(invoice, client, settings);
  };

  return (
    <PortalShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Invoices</span>
        </Link>

        {/* Invoice Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#082B52] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-xs font-bold uppercase text-[#D5A11E]">
                  {invoice.invoiceType.replace('_', ' ')}
                </span>
                <Badge status={isOverdue ? 'overdue' : invoice.status} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#082B52] mt-2 tracking-tight">
                {invoice.title}
              </h2>

              <p className="text-xs text-slate-600 font-medium mt-1">
                Client:{' '}
                <strong className="text-slate-900">
                  {client?.name} {client?.companyName ? `(${client.companyName})` : ''}
                </strong>
                {project && (
                  <span>
                    {' '}
                    • Project: <strong className="text-slate-900">{project.title}</strong>
                  </span>
                )}
              </p>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span>Issued: <strong className="text-slate-700">{formatDate(invoice.issueDate)}</strong></span>
                <span className={isOverdue ? 'text-red-700 font-bold' : ''}>
                  Due Date: <strong className={isOverdue ? 'text-red-700' : 'text-slate-700'}>{formatDate(invoice.dueDate)}</strong>
                </span>
                <span>Payment Ref: <strong className="font-mono text-slate-700">{invoice.paymentReference}</strong></span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              {invoice.balanceDue > 0 && (
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Record Payment</span>
                </button>
              )}

              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 text-xs font-bold transition-all border border-emerald-300"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Nudge</span>
              </button>

              <button
                onClick={() => setViewerOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-[#D5A11E]" />
                <span>Invoice PDF</span>
              </button>
            </div>
          </div>

          {/* Financial Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Invoiced</span>
              <p className="text-xl font-bold text-[#082B52] mt-0.5">{formatZAR(invoice.totalAmount)}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-bold">Amount Paid to Date</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{formatZAR(invoice.amountPaid)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <span className="text-[10px] text-red-700 uppercase font-bold">Remaining Balance Due</span>
              <p className="text-xl font-black text-red-700 mt-0.5">{formatZAR(invoice.balanceDue)}</p>
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <h3 className="font-bold text-lg text-[#082B52]">Invoice Line Items</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#082B52] text-white text-[11px]">
                  <th className="p-3 font-bold w-12">#</th>
                  <th className="p-3 font-bold">Description</th>
                  <th className="p-3 font-bold w-20 text-center">Unit</th>
                  <th className="p-3 font-bold w-20 text-right">Qty</th>
                  <th className="p-3 font-bold w-28 text-right">Rate</th>
                  <th className="p-3 font-bold w-32 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {(invoice.items || []).map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{item.description}</td>
                    <td className="p-3 text-center text-slate-600">{item.unit}</td>
                    <td className="p-3 text-right text-slate-700">{item.quantity}</td>
                    <td className="p-3 text-right text-slate-700">{formatZAR(item.unitRate)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatZAR(item.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold">{formatZAR(invoice.subtotal)}</span>
              </div>
              {invoice.retentionAmount > 0 && (
                <div className="flex justify-between text-rose-700 font-medium">
                  <span>Retention ({invoice.retentionPercentage}%):</span>
                  <span>-{formatZAR(invoice.retentionAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT (15%):</span>
                <span className="font-bold">{formatZAR(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#082B52] pt-1.5 border-t border-slate-200">
                <span>TOTAL INVOICED:</span>
                <span>{formatZAR(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Amount Paid:</span>
                <span>{formatZAR(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-red-700 pt-2 border-t-2 border-red-200 bg-red-50 p-2 rounded-lg">
                <span>BALANCE DUE:</span>
                <span>{formatZAR(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linked Milestone Payment Receipts */}
        {receipts.length > 0 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-[#082B52]">Logged Payment Receipts for this Invoice</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <th className="pb-2">Receipt #</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2">Reference</th>
                    <th className="pb-2 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.map((r) => (
                    <tr key={r.id}>
                      <td className="py-2.5 font-mono font-bold text-[#082B52]">{r.receiptNumber}</td>
                      <td className="py-2.5 text-slate-600">{formatDate(r.paymentDate)}</td>
                      <td className="py-2.5 text-slate-800 font-medium">{r.paymentMethod}</td>
                      <td className="py-2.5 font-mono text-slate-500">{r.bankReference || '-'}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-700">{formatZAR(r.amountPaid)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentType="invoice"
        invoice={invoice}
        client={client}
        settings={settings}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          refreshData();
        }}
        invoice={invoice}
        onPaymentSuccess={refreshData}
      />
    </PortalShell>
  );
}
