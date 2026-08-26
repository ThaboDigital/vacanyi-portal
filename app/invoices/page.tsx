'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Invoice, Client, InvoiceStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import { PaymentModal } from '@/components/documents/payment-modal';
import { DocumentScannerModal } from '@/components/documents/document-scanner-modal';
import {
  ReceiptText,
  Plus,
  Search,
  Share2,
  FileText,
  CreditCard,
  Building,
  ArrowUpRight,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [settings, setSettings] = useState(DataStore.getSettings());

  // Modals
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const refreshData = () => {
    setInvoices(DataStore.getInvoices());
    setClients(DataStore.getClients());
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const handlePreview = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setViewerOpen(true);
  };

  const handleWhatsAppNudge = (inv: Invoice) => {
    const client = clients.find((c) => c.id === inv.clientId);
    if (!client) return;
    const msg = WhatsAppShareService.createInvoiceMessage(inv, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, msg);
  };

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentTargetInvoice(inv);
    setPaymentModalOpen(true);
  };

  const filteredInvoices = invoices.filter((i) => {
    const client = clients.find((c) => c.id === i.clientId);
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(search.toLowerCase())) ||
      i.paymentReference.toLowerCase().includes(search.toLowerCase());

    const isOverdue = new Date(i.dueDate) < new Date() && i.status !== 'paid';
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'overdue' ? isOverdue : i.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">Tax Invoices & Progress Claims</h2>
            <p className="text-xs text-slate-500 mt-1">
              Issue progress drawdowns, manage retention deductions, track payment receipts, and deliver via 1-tap WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#D5A11E]/15 hover:bg-[#D5A11E]/25 text-[#082B52] border border-[#D5A11E]/30 text-xs font-bold transition-all shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#D5A11E]" />
              <span>AI Scan / Import Invoice</span>
            </button>

            <Link
              href="/invoices/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#D5A11E]" />
              <span>Create Tax Invoice</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice number, client name, title, reference..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#082B52]"
          >
            <option value="all">All Invoices</option>
            <option value="issued">Issued / Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Paid in Full</option>
            <option value="overdue">Overdue Invoices</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Client & Project</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Invoiced (ZAR)</th>
                  <th className="p-4 text-right">Paid (ZAR)</th>
                  <th className="p-4 text-right">Balance Due</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center">
                      <ReceiptText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">No Tax Invoices Found</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Issue professional contractor tax invoices and certified progress drawdown claims with banking details.
                      </p>
                      <Link
                        href="/invoices/new"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-[#D5A11E]" />
                        <span>Create Tax Invoice</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const client = clients.find((c) => c.id === inv.clientId);
                    const isOverdue = new Date(inv.dueDate) < new Date() && inv.status !== 'paid';

                    return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#082B52] whitespace-nowrap">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-4">
                        <h4 className="font-bold text-slate-900">{inv.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {client?.name} {client?.companyName ? `(${client.companyName})` : ''}
                        </p>
                      </td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">{formatDate(inv.issueDate)}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={isOverdue ? 'text-red-700 font-bold' : 'text-slate-600'}>
                          {formatDate(inv.dueDate)}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatZAR(inv.totalAmount)}
                      </td>
                      <td className="p-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                        {formatZAR(inv.amountPaid)}
                      </td>
                      <td className="p-4 text-right font-black whitespace-nowrap">
                        <span className={inv.balanceDue > 0 ? 'text-red-700' : 'text-slate-400'}>
                          {formatZAR(inv.balanceDue)}
                        </span>
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <Badge status={isOverdue && inv.status !== 'paid' ? 'overdue' : inv.status} />
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                        {inv.balanceDue > 0 && (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200"
                          >
                            Log Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleWhatsAppNudge(inv)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="1-Tap WhatsApp Invoice / Reminder"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePreview(inv)}
                          className="p-1.5 rounded-lg bg-[#082B52] text-white hover:bg-[#103D70] transition-colors"
                          title="Preview & Download PDF"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 inline-block transition-colors"
                          title="View Details"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedInvoice && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedInvoice(null);
          }}
          documentType="invoice"
          invoice={selectedInvoice}
          client={clients.find((c) => c.id === selectedInvoice.clientId)}
          settings={settings}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setPaymentTargetInvoice(null);
          refreshData();
        }}
        invoice={paymentTargetInvoice}
        onPaymentSuccess={refreshData}
      />

      {/* AI Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={scannerOpen}
        onClose={() => {
          setScannerOpen(false);
          refreshData();
        }}
      />
    </PortalShell>
  );
}
