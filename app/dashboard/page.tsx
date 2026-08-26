'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortalShell } from '@/components/layout/portal-shell';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { DataStore } from '@/lib/storage/data-store';
import {
  Wallet,
  HardHat,
  Receipt,
  ReceiptText,
  FileSpreadsheet,
  Plus,
  Share2,
  FileText,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import { PaymentModal } from '@/components/documents/payment-modal';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { Invoice, Quote, Client, Project, MilestoneReceipt } from '@/lib/types';

export default function DashboardPage() {
  const [settings, setSettings] = useState(DataStore.getSettings());
  const [financials, setFinancials] = useState(DataStore.getFinancialOverview());
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  // Modals state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'quote' | 'invoice' | 'receipt' | 'project_report'>('invoice');
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);

  const refreshData = () => {
    setSettings(DataStore.getSettings());
    setFinancials(DataStore.getFinancialOverview());
    setProjects(DataStore.getProjects());
    setInvoices(DataStore.getInvoices());
    setQuotes(DataStore.getQuotes());
    setClients(DataStore.getClients());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const handlePreviewInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setSelectedDocType('invoice');
    setViewerOpen(true);
  };

  const handlePreviewQuote = (q: Quote) => {
    setSelectedQuote(q);
    setSelectedDocType('quote');
    setViewerOpen(true);
  };

  const handleOpenPayment = (inv: Invoice) => {
    setPaymentTargetInvoice(inv);
    setPaymentModalOpen(true);
  };

  const handleWhatsAppNudge = (inv: Invoice) => {
    const client = clients.find((c) => c.id === inv.clientId);
    if (!client) return;
    const msg = WhatsAppShareService.createInvoiceMessage(inv, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, msg);
  };

  const activeProjects = projects.filter((p) => p.status === 'in_progress').slice(0, 3);
  const outstandingInvoices = invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').slice(0, 4);
  const recentQuotes = quotes.slice(0, 4);

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#082B52] to-[#0A386B] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-[#061E39] relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#D5A11E] text-[#082B52] mb-2">
              Executive Dashboard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {settings.companyName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Turnkey Contractor Management Portal • Real-time project milestones, billings, and automated 1-tap WhatsApp sharing.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2.5">
            <Link
              href="/quotes/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D5A11E] hover:bg-[#B38615] text-[#082B52] text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Quote</span>
            </Link>
            <Link
              href="/invoices/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              <Receipt className="w-4 h-4 text-[#F1D681]" />
              <span>New Invoice</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue Collected"
            value={formatZAR(financials.totalRevenueCollected)}
            subtitle="Cash received YTD"
            icon={Wallet}
            variant="navy"
          />
          <StatCard
            title="Active Site Projects"
            value={financials.activeProjectsCount}
            subtitle={`${financials.completedProjectsCount} completed to date`}
            icon={HardHat}
            variant="gold"
          />
          <StatCard
            title="Outstanding Receivables"
            value={formatZAR(financials.totalReceivables)}
            subtitle={
              financials.overdueInvoicesCount > 0
                ? `${financials.overdueInvoicesCount} overdue (${formatZAR(financials.overdueReceivables)})`
                : 'All accounts current'
            }
            icon={Receipt}
            variant={financials.overdueInvoicesCount > 0 ? 'amber' : 'default'}
          />
          <StatCard
            title="Active Quotes Pipeline"
            value={formatZAR(financials.activeQuotesPipeline)}
            subtitle="Estimates awaiting sign-off"
            icon={FileSpreadsheet}
            variant="default"
          />
        </div>

        {/* Main Grid: Active Sites & Outstanding Receivables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Site Projects (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#082B52] text-base">Active Construction Sites</h3>
                <p className="text-xs text-slate-500">Live milestone progress and contract stage status</p>
              </div>
              <Link
                href="/projects"
                className="text-xs font-bold text-[#082B52] hover:text-[#D5A11E] flex items-center gap-1 transition-colors"
              >
                <span>View All Projects</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {activeProjects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <HardHat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600">No active construction sites registered yet.</p>
                  <Link
                    href="/projects?new=true"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#082B52] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D5A11E]" />
                    <span>Register Site Project</span>
                  </Link>
                </div>
              ) : (
                activeProjects.map((project) => {
                  const client = clients.find((c) => c.id === project.clientId);
                  return (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#082B52] bg-white px-2 py-0.5 rounded border border-slate-200">
                              {project.projectCode}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm">{project.title}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {client?.name} • <span className="text-slate-700">{project.siteAddress}</span>
                          </p>
                        </div>
                        <div className="text-right sm:shrink-0">
                          <span className="text-xs font-bold text-slate-900 block">
                            {formatZAR(project.contractValue)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Foreman: {project.siteForeman || 'Vacanyi Site Team'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-600">Milestone Progress:</span>
                          <span className="font-bold text-emerald-700">{project.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Outstanding Receivables & Follow-ups (1 Column) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-[#082B52] text-base">Receivables Follow-Up</h3>
                  <p className="text-xs text-slate-500">1-Tap WhatsApp Payment Nudge</p>
                </div>
                <Link
                  href="/invoices"
                  className="text-xs font-bold text-[#082B52] hover:text-[#D5A11E] flex items-center gap-1"
                >
                  <span>All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {outstandingInvoices.length === 0 ? (
                  <div className="p-6 text-center bg-emerald-50/50 rounded-xl border border-dashed border-emerald-200">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                    <p className="text-xs font-bold text-emerald-950">All Client Accounts Up-to-Date</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">No outstanding receivables or overdue claims.</p>
                  </div>
                ) : (
                  outstandingInvoices.map((inv) => {
                    const client = clients.find((c) => c.id === inv.clientId);
                    const isOverdue = new Date(inv.dueDate) < new Date();

                    return (
                      <div
                        key={inv.id}
                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                          isOverdue
                            ? 'bg-rose-50/60 border-rose-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-[#082B52]">{inv.invoiceNumber}</span>
                            <p className="font-semibold text-slate-900 mt-0.5">{client?.name}</p>
                            <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{inv.title}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-red-700 block text-xs">
                              {formatZAR(inv.balanceDue)}
                            </span>
                            <span className={`text-[10px] font-semibold ${isOverdue ? 'text-red-700' : 'text-slate-500'}`}>
                              {isOverdue ? 'Overdue' : `Due ${formatDate(inv.dueDate)}`}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-current/10">
                          <button
                            onClick={() => handleWhatsAppNudge(inv)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>WhatsApp Nudge</span>
                          </button>
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-3 py-1.5 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white font-bold text-[11px] transition-colors"
                          >
                            Log Pay
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/80 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Automatic Milestone Receipts</span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                Logging a payment immediately updates invoice balances and generates a stamped milestone receipt for 1-tap WhatsApp sharing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Invoices & BOQ Quotations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#082B52] text-base">Recent Invoices & Claims</h3>
              <Link href="/invoices" className="text-xs font-bold text-[#082B52] hover:text-[#D5A11E] flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {invoices.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <ReceiptText className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">No invoices issued yet.</p>
                  <Link
                    href="/invoices/new"
                    className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 bg-[#082B52] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D5A11E]" />
                    <span>Create Tax Invoice</span>
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="pb-2">Invoice</th>
                      <th className="pb-2">Client</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.slice(0, 5).map((inv) => {
                      const client = clients.find((c) => c.id === inv.clientId);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-mono font-bold text-[#082B52]">
                            {inv.invoiceNumber}
                          </td>
                          <td className="py-2.5 text-slate-800 font-medium">{client?.name || '-'}</td>
                          <td className="py-2.5 text-right font-bold text-slate-900">
                            {formatZAR(inv.totalAmount)}
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge status={inv.status} />
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handlePreviewInvoice(inv)}
                              className="p-1 text-slate-500 hover:text-[#082B52] transition-colors"
                              title="Preview PDF"
                            >
                              <FileText className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Recent BOQ Quotations */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#082B52] text-base">Active Quotations (BOQ)</h3>
              <Link href="/quotes" className="text-xs font-bold text-[#082B52] hover:text-[#D5A11E] flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              {quotes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <FileSpreadsheet className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-600">No BOQ quotations created yet.</p>
                  <Link
                    href="/quotes/new"
                    className="mt-2.5 inline-flex items-center gap-1 px-3 py-1.5 bg-[#082B52] text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D5A11E]" />
                    <span>Create BOQ Quote</span>
                  </Link>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="pb-2">Quote #</th>
                      <th className="pb-2">Project / Client</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentQuotes.map((q) => {
                      const client = clients.find((c) => c.id === q.clientId);
                      return (
                        <tr key={q.id} className="hover:bg-slate-50">
                          <td className="py-2.5 font-mono font-bold text-[#082B52]">
                            {q.quoteNumber}
                          </td>
                          <td className="py-2.5 text-slate-800">
                            <p className="font-medium truncate max-w-[140px]">{q.title}</p>
                            <span className="text-[10px] text-slate-500">{client?.name}</span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-900">
                            {formatZAR(q.totalAmount)}
                          </td>
                          <td className="py-2.5 text-center">
                            <Badge status={q.status} />
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => handlePreviewQuote(q)}
                              className="p-1 text-slate-500 hover:text-[#082B52] transition-colors"
                              title="Preview PDF"
                            >
                              <FileText className="w-4 h-4 inline" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentType={selectedDocType}
        quote={selectedQuote}
        invoice={selectedInvoice}
        client={
          selectedDocType === 'quote' && selectedQuote
            ? clients.find((c) => c.id === selectedQuote.clientId)
            : selectedDocType === 'invoice' && selectedInvoice
            ? clients.find((c) => c.id === selectedInvoice.clientId)
            : undefined
        }
        settings={settings}
      />

      {/* Payment Recording Modal */}
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
    </PortalShell>
  );
}
