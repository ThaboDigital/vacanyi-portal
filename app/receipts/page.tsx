'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { MilestoneReceipt, Client, Project, Invoice } from '@/lib/types';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import {
  FileCheck2,
  Plus,
  Search,
  Share2,
  FileText,
  CreditCard,
  Building,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<MilestoneReceipt[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [settings, setSettings] = useState(DataStore.getSettings());

  // PDF Viewer Modal
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<MilestoneReceipt | null>(null);

  const refreshData = () => {
    setReceipts(DataStore.getReceipts());
    setClients(DataStore.getClients());
    setInvoices(DataStore.getInvoices());
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const handlePreview = (r: MilestoneReceipt) => {
    setSelectedReceipt(r);
    setViewerOpen(true);
  };

  const handleWhatsApp = (r: MilestoneReceipt) => {
    const client = clients.find((c) => c.id === r.clientId);
    if (!client) return;
    const msg = WhatsAppShareService.createReceiptMessage(r, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, msg);
  };

  const filteredReceipts = receipts.filter((r) => {
    const client = clients.find((c) => c.id === r.clientId);
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.milestoneDescription.toLowerCase().includes(search.toLowerCase()) ||
      (r.bankReference && r.bankReference.toLowerCase().includes(search.toLowerCase())) ||
      (client && client.name.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || r.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = receipts.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">Milestone Payment Receipts</h2>
            <p className="text-xs text-slate-500 mt-1">
              Official payment acknowledgement ledger, proof of payment records, and 1-tap WhatsApp receipt distribution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Total Collected YTD</span>
              <p className="text-base font-black text-emerald-800">{formatZAR(totalCollected)}</p>
            </div>
            <Link
              href="/receipts/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-[#D5A11E]" />
              <span>Issue New Receipt</span>
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
              placeholder="Search by receipt number, client, bank reference, or milestone..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#082B52]"
          >
            <option value="all">All Payment Methods</option>
            <option value="EFT">EFT Bank Transfer</option>
            <option value="Instant EFT">Instant EFT</option>
            <option value="Bank Deposit">Cash Bank Deposit</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        {/* Receipts Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-4">Receipt #</th>
                  <th className="p-4">Client & Project</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Milestone Stage Credited</th>
                  <th className="p-4">Method & Ref</th>
                  <th className="p-4 text-right">Amount Received (ZAR)</th>
                  <th className="p-4 text-right">Remaining Balance</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <h4 className="text-sm font-bold text-slate-800">No Payment Receipts Logged</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Acknowledge client EFT or cash payments with official stamped construction drawdown receipts.
                      </p>
                      <Link
                        href="/receipts/new"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold rounded-xl shadow-xs"
                      >
                        <Plus className="w-4 h-4 text-[#D5A11E]" />
                        <span>Issue Payment Receipt</span>
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredReceipts.map((r) => {
                    const client = clients.find((c) => c.id === r.clientId);

                    return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#082B52] whitespace-nowrap">
                        {r.receiptNumber}
                      </td>
                      <td className="p-4">
                        <h4 className="font-bold text-slate-900">{client?.name}</h4>
                        {client?.companyName && (
                          <p className="text-[11px] text-slate-500">{client.companyName}</p>
                        )}
                      </td>
                      <td className="p-4 text-slate-600 whitespace-nowrap">{formatDate(r.paymentDate)}</td>
                      <td className="p-4 font-medium text-slate-800">{r.milestoneDescription}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700 block">{r.paymentMethod}</span>
                        <span className="font-mono text-[10px] text-slate-500">{r.bankReference || '-'}</span>
                      </td>
                      <td className="p-4 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                        {formatZAR(r.amountPaid)}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-700 whitespace-nowrap">
                        {formatZAR(r.remainingProjectBalance)}
                      </td>
                      <td className="p-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleWhatsApp(r)}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          title="1-Tap WhatsApp Official Receipt"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePreview(r)}
                          className="p-1.5 rounded-lg bg-[#082B52] text-white hover:bg-[#103D70] transition-colors"
                          title="Preview & Download PDF Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/receipts/${r.id}`}
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
      {selectedReceipt && (
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => {
            setViewerOpen(false);
            setSelectedReceipt(null);
          }}
          documentType="receipt"
          receipt={selectedReceipt}
          client={clients.find((c) => c.id === selectedReceipt.clientId)}
          settings={settings}
        />
      )}
    </PortalShell>
  );
}
