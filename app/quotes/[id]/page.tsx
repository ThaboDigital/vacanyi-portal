'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Quote, Client, Project, QuoteStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import {
  ArrowLeft,
  FileSpreadsheet,
  Share2,
  FileText,
  Building,
  Printer,
  ReceiptText,
  HardHat,
  CheckCircle2,
  Clock,
  Send,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { EmailShareService } from '@/lib/share/email';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | undefined>();
  const [client, setClient] = useState<Client | undefined>();
  const [project, setProject] = useState<Project | undefined>();
  const [settings, setSettings] = useState(DataStore.getSettings());
  const [viewerOpen, setViewerOpen] = useState(false);

  const refreshData = () => {
    const q = DataStore.getQuoteById(quoteId);
    setQuote(q);
    if (q) {
      setClient(DataStore.getClientById(q.clientId));
      if (q.projectId) {
        setProject(DataStore.getProjectById(q.projectId));
      }
    }
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, [quoteId]);

  if (!quote) {
    return (
      <PortalShell>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Quotation not found.</p>
          <Link href="/quotes" className="mt-4 inline-block px-4 py-2 bg-[#082B52] text-white rounded-lg text-xs font-bold">
            Back to Quotes
          </Link>
        </div>
      </PortalShell>
    );
  }

  const handleStatusChange = (status: QuoteStatus) => {
    DataStore.saveQuote({ ...quote, status }, quote.items || []);
    refreshData();
  };

  const handleWhatsAppShare = () => {
    if (!client) return;
    const message = WhatsAppShareService.createQuoteMessage(quote, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, message);
  };

  const handleEmailShare = () => {
    if (!client) return;
    EmailShareService.sendQuoteEmail(quote, client, settings);
  };

  const handleConvertToInvoice = () => {
    if (!client) return;
    const inv = DataStore.saveInvoice(
      {
        clientId: quote.clientId,
        projectId: quote.projectId,
        quoteId: quote.id,
        title: `Invoice for ${quote.title}`,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        status: 'issued',
        retentionPercentage: 0,
        vatPercentage: quote.vatPercentage,
        notes: `Generated from Quotation #${quote.quoteNumber}`,
      },
      (quote.items || []).map((item) => ({
        description: `[${item.category}] ${item.description}`,
        unit: item.unit,
        quantity: item.quantity,
        unitRate: item.unitRate,
        totalAmount: item.totalAmount,
      }))
    );

    // Update quote status to invoiced
    DataStore.saveQuote({ ...quote, status: 'invoiced' }, quote.items || []);
    router.push(`/invoices/${inv.id}`);
  };

  const handleConvertToProject = () => {
    if (!client) return;
    const p = DataStore.saveProject({
      clientId: quote.clientId,
      title: quote.title,
      siteAddress: quote.siteAddress,
      contractValue: quote.totalAmount,
      status: 'in_progress',
      description: quote.scopeOfWork || 'Turnkey construction works as per quotation.',
      notes: `Created from Quotation #${quote.quoteNumber}`,
    });

    // Populate initial milestones
    DataStore.saveMilestone({
      projectId: p.id,
      orderIndex: 1,
      title: 'Mobilization & Foundation Phase',
      percentageOfContract: 30,
      amount: (p.contractValue * 30) / 100,
      status: 'pending',
    });
    DataStore.saveMilestone({
      projectId: p.id,
      orderIndex: 2,
      title: 'Superstructure Brickwork to Wallplate',
      percentageOfContract: 30,
      amount: (p.contractValue * 30) / 100,
      status: 'pending',
    });
    DataStore.saveMilestone({
      projectId: p.id,
      orderIndex: 3,
      title: 'Roof Trusses, Sheeting & Plaster',
      percentageOfContract: 25,
      amount: (p.contractValue * 25) / 100,
      status: 'pending',
    });
    DataStore.saveMilestone({
      projectId: p.id,
      orderIndex: 4,
      title: 'Interior Finishes & Handover',
      percentageOfContract: 15,
      amount: (p.contractValue * 15) / 100,
      status: 'pending',
    });

    // Link project to quote
    DataStore.saveQuote({ ...quote, projectId: p.id, status: 'accepted' }, quote.items || []);
    router.push(`/projects/${p.id}`);
  };

  return (
    <PortalShell>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Back Link */}
        <Link
          href="/quotes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Quotations</span>
        </Link>

        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#082B52] bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  {quote.quoteNumber}
                </span>
                <Badge status={quote.status} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#082B52] mt-2 tracking-tight">
                {quote.title}
              </h2>

              <p className="text-xs text-slate-600 font-medium mt-1">
                Client:{' '}
                <strong className="text-slate-900">
                  {client?.name} {client?.companyName ? `(${client.companyName})` : ''}
                </strong>{' '}
                • Site: <strong className="text-slate-900">{quote.siteAddress}</strong>
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Issued: {formatDate(quote.issueDate)} • Valid until: {formatDate(quote.expiryDate)}
              </p>
            </div>

            {/* Quick Actions */}
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
                <span>Preview PDF</span>
              </button>
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Status:</span>
              <select
                value={quote.status}
                onChange={(e) => handleStatusChange(e.target.value as QuoteStatus)}
                className="px-2.5 py-1.5 font-bold rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-hidden"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="accepted">Accepted / Approved</option>
                <option value="declined">Declined</option>
                <option value="invoiced">Invoiced</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleConvertToInvoice}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <ReceiptText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Convert to Tax Invoice</span>
              </button>

              {!quote.projectId && (
                <button
                  onClick={handleConvertToProject}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <HardHat className="w-3.5 h-3.5 text-[#082B52]" />
                  <span>Create Site Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bill of Quantities Details Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-[#082B52]">Bill of Quantities (BOQ) Breakdown</h3>
            <span className="text-xs font-bold text-slate-500">
              {(quote.items || []).length} Line Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#082B52] text-white text-[11px]">
                  <th className="p-3 font-bold w-12">#</th>
                  <th className="p-3 font-bold">Category & Description</th>
                  <th className="p-3 font-bold w-20 text-center">Unit</th>
                  <th className="p-3 font-bold w-20 text-right">Qty</th>
                  <th className="p-3 font-bold w-28 text-right">Rate</th>
                  <th className="p-3 font-bold w-32 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                {(quote.items || []).map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-bold text-[#082B52] block text-[11px]">{item.category}</span>
                      <span className="text-slate-800">{item.description}</span>
                    </td>
                    <td className="p-3 text-center font-medium text-slate-600">{item.unit}</td>
                    <td className="p-3 text-right font-medium text-slate-700">{item.quantity}</td>
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
                <span className="font-bold">{formatZAR(quote.subtotal)}</span>
              </div>
              {quote.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span>-{formatZAR(quote.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT (15%):</span>
                <span className="font-bold">{formatZAR(quote.vatAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-[#082B52] pt-2 border-t-2 border-slate-300">
                <span>TOTAL QUOTE:</span>
                <span>{formatZAR(quote.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentType="quote"
        quote={quote}
        client={client}
        settings={settings}
      />
    </PortalShell>
  );
}
