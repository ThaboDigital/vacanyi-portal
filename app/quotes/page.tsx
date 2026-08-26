'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Quote, Client, QuoteStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import { DocumentScannerModal } from '@/components/documents/document-scanner-modal';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Share2,
  FileText,
  Building,
  ArrowUpRight,
  ReceiptText,
  HardHat,
  ScanLine,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [settings, setSettings] = useState(DataStore.getSettings());

  // PDF Viewer Modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const refreshData = () => {
    setQuotes(DataStore.getQuotes());
    setClients(DataStore.getClients());
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const handlePreview = (q: Quote) => {
    setSelectedQuote(q);
    setViewerOpen(true);
  };

  const handleWhatsApp = (q: Quote) => {
    const client = clients.find((c) => c.id === q.clientId);
    if (!client) return;
    const msg = WhatsAppShareService.createQuoteMessage(q, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, msg);
  };

  const filteredQuotes = quotes.filter((q) => {
    const client = clients.find((c) => c.id === q.clientId);
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">BOQ Quotations & Estimates</h2>
            <p className="text-xs text-slate-500 mt-1">
              Build trade-categorized Bill of Quantities (BOQ), configure milestone drawdowns, and share via 1-tap WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#082B52] border border-slate-200 text-xs font-bold transition-all shadow-2xs"
            >
              <ScanLine className="w-4 h-4 text-[#082B52]" />
              <span>Scan & Import Quote</span>
            </button>

            <Link
              href="/quotes/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#D5A11E]" />
              <span>Create BOQ Quotation</span>
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
              placeholder="Search by quote number, project, client..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#082B52]"
          >
            <option value="all">All Quotation Statuses</option>
            <option value="sent">Sent to Client</option>
            <option value="accepted">Accepted / Approved</option>
            <option value="draft">Draft</option>
            <option value="declined">Declined</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Quotes Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-4">Quote Ref</th>
                  <th className="p-4">Project & Client</th>
                  <th className="p-4">Issue Date</th>
                  <th className="p-4">Valid Until</th>
                  <th className="p-4 text-right">Subtotal</th>
                  <th className="p-4 text-right">Total (incl. VAT)</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">No BOQ Quotations Found</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Create detailed Bill of Quantities (BOQ) estimates with trades, quantities, 15% VAT, and payment milestone schedules.
                      </p>
                      <Link
                        href="/quotes/new"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-[#D5A11E]" />
                        <span>Create New BOQ Quote</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => {
                    const client = clients.find((c) => c.id === q.clientId);

                    return (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#082B52] whitespace-nowrap">
                          {q.quoteNumber}
                        </td>
                        <td className="p-4">
                          <h4 className="font-bold text-slate-900">{q.title}</h4>
                          <p className="text-[11px] text-slate-500">{client?.name || 'Unassigned'}</p>
                        </td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">{formatDate(q.issueDate)}</td>
                        <td className="p-4 text-slate-600 whitespace-nowrap">{formatDate(q.expiryDate)}</td>
                        <td className="p-4 text-right font-medium text-slate-700 whitespace-nowrap">
                          {formatZAR(q.subtotal)}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900 whitespace-nowrap">
                          {formatZAR(q.totalAmount)}
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          <Badge status={q.status} />
                        </td>
                        <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => handleWhatsApp(q)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="1-Tap WhatsApp Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePreview(q)}
                            className="p-1.5 rounded-lg bg-[#082B52] text-white hover:bg-[#103D70] transition-colors"
                            title="Preview PDF"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href={`/quotes/${q.id}`}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 inline-block transition-colors"
                            title="Edit / View Details"
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

      {/* Document Viewer Modal */}
      {selectedQuote && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedQuote(null);
          }}
          documentType="quote"
          quote={selectedQuote}
          client={clients.find((c) => c.id === selectedQuote.clientId)}
          settings={settings}
        />
      )}

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
