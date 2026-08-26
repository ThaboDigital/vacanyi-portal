'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { MilestoneReceipt, Client, Project, Invoice } from '@/lib/types';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import {
  ArrowLeft,
  FileCheck2,
  Share2,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { EmailShareService } from '@/lib/share/email';

export default function ReceiptDetailPage() {
  const params = useParams();
  const receiptId = params.id as string;

  const [receipt, setReceipt] = useState<MilestoneReceipt | undefined>();
  const [client, setClient] = useState<Client | undefined>();
  const [project, setProject] = useState<Project | undefined>();
  const [invoice, setInvoice] = useState<Invoice | undefined>();
  const [settings, setSettings] = useState(DataStore.getSettings());
  const [viewerOpen, setViewerOpen] = useState(false);

  const refreshData = () => {
    const r = DataStore.getReceiptById(receiptId);
    setReceipt(r);
    if (r) {
      setClient(DataStore.getClientById(r.clientId));
      if (r.projectId) {
        setProject(DataStore.getProjectById(r.projectId));
      }
      if (r.invoiceId) {
        setInvoice(DataStore.getInvoiceById(r.invoiceId));
      }
    }
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, [receiptId]);

  if (!receipt) {
    return (
      <PortalShell>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Receipt not found.</p>
          <Link href="/receipts" className="mt-4 inline-block px-4 py-2 bg-[#082B52] text-white rounded-lg text-xs font-bold">
            Back to Receipts
          </Link>
        </div>
      </PortalShell>
    );
  }

  const handleWhatsAppShare = () => {
    if (!client) return;
    const message = WhatsAppShareService.createReceiptMessage(receipt, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, message);
  };

  const handleEmailShare = () => {
    if (!client) return;
    EmailShareService.sendReceiptEmail(receipt, client, settings);
  };

  return (
    <PortalShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/receipts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Receipts</span>
        </Link>

        {/* Official Receipt Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#082B52] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {receipt.receiptNumber}
                </span>
                <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  ✓ Official Payment Receipt
                </span>
              </div>
              <h2 className="text-2xl font-black text-[#082B52] mt-2">
                Payment Received: {formatZAR(receipt.amountPaid)}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Issued on {formatDate(receipt.paymentDate)} • Processed by {receipt.receivedBy}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>1-Tap WhatsApp</span>
              </button>

              <button
                onClick={() => setViewerOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-[#D5A11E]" />
                <span>Receipt PDF</span>
              </button>
            </div>
          </div>

          {/* Stamped Confirmation Box */}
          <div className="border-2 border-emerald-500 bg-emerald-50/70 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">Official Construction Drawdown Receipt</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Payment confirmed and allocated against contract milestone stage.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-emerald-800 uppercase font-bold">Amount Paid</span>
              <p className="text-2xl font-black text-emerald-950">{formatZAR(receipt.amountPaid)}</p>
            </div>
          </div>

          {/* Receipt Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Client:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{client?.name}</p>
              {client?.companyName && <p className="text-slate-600">{client.companyName}</p>}
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Milestone Stage Credited:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.milestoneDescription}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Payment Method:</span>
              <p className="font-semibold text-slate-800 mt-0.5">{receipt.paymentMethod}</p>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Bank Transaction Reference:</span>
              <p className="font-mono font-bold text-[#082B52] mt-0.5">{receipt.bankReference || '-'}</p>
            </div>

            {invoice && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold">Linked Invoice:</span>
                <p className="font-mono font-bold text-[#082B52] mt-0.5">
                  <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                    {invoice.invoiceNumber} — {invoice.title}
                  </Link>
                </p>
              </div>
            )}

            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold">Remaining Contract Balance:</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {formatZAR(receipt.remainingProjectBalance)}
              </p>
            </div>
          </div>

          {receipt.notes && (
            <div className="text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Receipt Notes:</span>
              <p className="text-slate-600">{receipt.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentType="receipt"
        receipt={receipt}
        client={client}
        settings={settings}
      />
    </PortalShell>
  );
}
