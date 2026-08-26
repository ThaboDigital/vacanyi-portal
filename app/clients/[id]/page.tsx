'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Client, Project, Quote, Invoice, MilestoneReceipt } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { DocumentViewerModal } from '@/components/documents/document-viewer-modal';
import { PaymentModal } from '@/components/documents/payment-modal';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Building,
  Share2,
  FileText,
  CreditCard,
  HardHat,
  FileSpreadsheet,
  ReceiptText,
  FileCheck2,
  Plus,
  Edit3,
} from 'lucide-react';
import { formatZAR, formatDate, formatPhoneDisplay } from '@/lib/utils/formatters';
import { WhatsAppShareService } from '@/lib/share/whatsapp';

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<MilestoneReceipt[]>([]);
  const [settings, setSettings] = useState(DataStore.getSettings());
  const [activeTab, setActiveTab] = useState<'projects' | 'invoices' | 'quotes' | 'receipts'>('invoices');

  // Modals
  const [viewerOpen, setViewerOpen] = useState(false);
  const [docType, setDocType] = useState<'quote' | 'invoice' | 'receipt' | 'statement'>('statement');
  const [activeQuote, setActiveQuote] = useState<Quote | undefined>();
  const [activeInvoice, setActiveInvoice] = useState<Invoice | undefined>();
  const [activeReceipt, setActiveReceipt] = useState<MilestoneReceipt | undefined>();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentTargetInvoice, setPaymentTargetInvoice] = useState<Invoice | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name || !editingClient.phone) return;

    DataStore.saveClient({
      ...editingClient,
      id: clientId,
      name: editingClient.name,
      phone: editingClient.phone,
      whatsappPhone: editingClient.whatsappPhone || editingClient.phone,
    });

    setIsEditModalOpen(false);
    refreshData();
  };

  const refreshData = () => {
    const c = DataStore.getClientById(clientId);
    setClient(c);
    setProjects(DataStore.getProjects().filter((p) => p.clientId === clientId));
    setQuotes(DataStore.getQuotes().filter((q) => q.clientId === clientId));
    setInvoices(DataStore.getInvoices().filter((i) => i.clientId === clientId));
    setReceipts(DataStore.getReceipts().filter((r) => r.clientId === clientId));
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, [clientId]);

  if (!client) {
    return (
      <PortalShell>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Client profile not found.</p>
          <Link href="/clients" className="mt-4 inline-block px-4 py-2 bg-[#082B52] text-white rounded-lg text-xs font-bold">
            Back to Clients
          </Link>
        </div>
      </PortalShell>
    );
  }

  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const totalPaid = receipts.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);
  const balanceDue = invoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

  const handleOpenStatement = () => {
    setDocType('statement');
    setViewerOpen(true);
  };

  const handleWhatsAppStatement = () => {
    const msg = WhatsAppShareService.createStatementMessage(client, totalInvoiced, totalPaid, balanceDue, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, msg);
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Clients</span>
        </Link>

        {/* Client Profile Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5A11E] bg-[#082B52] px-2.5 py-0.5 rounded">
                  {client.clientType}
                </span>
                <Badge status={client.status} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#082B52] mt-2 tracking-tight">
                {client.name}
              </h2>
              {client.companyName && (
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{client.companyName}</span>
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 text-[#082B52] font-semibold hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{formatPhoneDisplay(client.phone)}</span>
                </a>
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 text-slate-600 hover:underline"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.email}</span>
                  </a>
                )}
                {client.physicalAddress && (
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.physicalAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setEditingClient({ ...client });
                  setIsEditModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all shadow-xs"
              >
                <Edit3 className="w-4 h-4 text-amber-700" />
                <span>Edit Client Details</span>
              </button>

              <button
                onClick={handleWhatsAppStatement}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <Share2 className="w-4 h-4" />
                <span>1-Tap WhatsApp</span>
              </button>
              <button
                onClick={handleOpenStatement}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs"
              >
                <FileText className="w-4 h-4 text-[#D5A11E]" />
                <span>Statement PDF</span>
              </button>
            </div>
          </div>

          {/* Client Financial Ledger Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Total Invoiced to Date</span>
              <p className="text-xl font-bold text-[#082B52] mt-0.5">{formatZAR(totalInvoiced)}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase font-bold">Total Cash Received</span>
              <p className="text-xl font-bold text-emerald-800 mt-0.5">{formatZAR(totalPaid)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <span className="text-[10px] text-red-700 uppercase font-bold">Outstanding Balance Due</span>
              <p className="text-xl font-black text-red-700 mt-0.5">{formatZAR(balanceDue)}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex gap-2">
          {[
            { id: 'invoices', label: `Tax Invoices (${invoices.length})`, icon: ReceiptText },
            { id: 'quotes', label: `Quotations (${quotes.length})`, icon: FileSpreadsheet },
            { id: 'projects', label: `Site Projects (${projects.length})`, icon: HardHat },
            { id: 'receipts', label: `Milestone Receipts (${receipts.length})`, icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                  isActive
                    ? 'border-[#082B52] text-[#082B52]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}

        {/* 1. Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#082B52]">Tax Invoices & Progress Claims</h3>
              <Link
                href={`/invoices/new?clientId=${client.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#082B52] text-white rounded-lg text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 text-[#D5A11E]" />
                <span>New Invoice</span>
              </Link>
            </div>

            {invoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No invoices issued to this client yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Issue Date</th>
                      <th className="pb-2">Due Date</th>
                      <th className="pb-2 text-right">Total</th>
                      <th className="pb-2 text-right">Balance</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-[#082B52]">{inv.invoiceNumber}</td>
                        <td className="py-3 font-medium text-slate-800">{inv.title}</td>
                        <td className="py-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                        <td className="py-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="py-3 text-right font-bold text-slate-900">{formatZAR(inv.totalAmount)}</td>
                        <td className="py-3 text-right font-bold text-red-700">{formatZAR(inv.balanceDue)}</td>
                        <td className="py-3 text-center"><Badge status={inv.status} /></td>
                        <td className="py-3 text-right space-x-2">
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => {
                                setPaymentTargetInvoice(inv);
                                setPaymentModalOpen(true);
                              }}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold"
                            >
                              Log Pay
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setActiveInvoice(inv);
                              setDocType('invoice');
                              setViewerOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-[#082B52]"
                            title="Preview PDF"
                          >
                            <FileText className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. Quotes Tab */}
        {activeTab === 'quotes' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#082B52]">BOQ Quotations & Estimates</h3>
              <Link
                href={`/quotes/new?clientId=${client.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#082B52] text-white rounded-lg text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 text-[#D5A11E]" />
                <span>New Quote</span>
              </Link>
            </div>

            {quotes.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No quotations created for this client yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="pb-2">Quote #</th>
                      <th className="pb-2">Title</th>
                      <th className="pb-2">Date Issued</th>
                      <th className="pb-2">Expiry Date</th>
                      <th className="pb-2 text-right">Total Amount</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-[#082B52]">{q.quoteNumber}</td>
                        <td className="py-3 font-medium text-slate-800">{q.title}</td>
                        <td className="py-3 text-slate-600">{formatDate(q.issueDate)}</td>
                        <td className="py-3 text-slate-600">{formatDate(q.expiryDate)}</td>
                        <td className="py-3 text-right font-bold text-slate-900">{formatZAR(q.totalAmount)}</td>
                        <td className="py-3 text-center"><Badge status={q.status} /></td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveQuote(q);
                              setDocType('quote');
                              setViewerOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-[#082B52]"
                            title="Preview PDF"
                          >
                            <FileText className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 3. Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-[#082B52]">Construction Projects</h3>
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No projects registered for this client yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-all block"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-[#082B52] bg-white px-2 py-0.5 rounded border border-slate-200">
                          {p.projectCode}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{p.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{p.siteAddress}</p>
                      </div>
                      <Badge status={p.status} />
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between text-xs font-semibold">
                      <span>Value: {formatZAR(p.contractValue)}</span>
                      <span className="text-emerald-700">{p.progressPercentage}% Completed</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-[#082B52]">Official Milestone Payment Receipts</h3>
            {receipts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No payment receipts issued for this client yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="pb-2">Receipt #</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Milestone Credited</th>
                      <th className="pb-2">Method</th>
                      <th className="pb-2">Bank Reference</th>
                      <th className="pb-2 text-right">Amount Paid</th>
                      <th className="pb-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipts.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-3 font-mono font-bold text-[#082B52]">{r.receiptNumber}</td>
                        <td className="py-3 text-slate-600">{formatDate(r.paymentDate)}</td>
                        <td className="py-3 text-slate-800 font-medium">{r.milestoneDescription}</td>
                        <td className="py-3 text-slate-600">{r.paymentMethod}</td>
                        <td className="py-3 font-mono text-slate-500">{r.bankReference || '-'}</td>
                        <td className="py-3 text-right font-bold text-emerald-700">{formatZAR(r.amountPaid)}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => {
                              setActiveReceipt(r);
                              setDocType('receipt');
                              setViewerOpen(true);
                            }}
                            className="p-1 text-slate-500 hover:text-[#082B52]"
                            title="Preview PDF"
                          >
                            <FileText className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        documentType={docType}
        quote={activeQuote}
        invoice={activeInvoice}
        receipt={activeReceipt}
        client={client}
        settings={settings}
        statementData={{
          invoices,
          receipts,
          totalInvoiced,
          totalPaid,
          balanceDue,
        }}
      />

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

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }}
        title="Edit Client Profile"
        subtitle="Update contact details, site address and compliance information"
      >
        <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Full Name / Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingClient?.name || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. M E N Mashatole"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Company / Entity Name</label>
              <input
                type="text"
                value={editingClient?.companyName || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="e.g. Sambo Medical Properties"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editingClient?.phone || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +27 73 368 2204"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={editingClient?.whatsappPhone || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, whatsappPhone: e.target.value }))}
                placeholder="e.g. 27733682204"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={editingClient?.email || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. client@example.co.za"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ID / Registration Number</label>
              <input
                type="text"
                value={editingClient?.idOrRegistrationNumber || ''}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, idOrRegistrationNumber: e.target.value }))}
                placeholder="e.g. ID or CIPC Reg Number"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Site / Physical Address</label>
            <input
              type="text"
              value={editingClient?.physicalAddress || ''}
              onChange={(e) => setEditingClient((prev) => ({ ...prev, physicalAddress: e.target.value }))}
              placeholder="e.g. Tickiline Village, Tzaneen, Limpopo, 0850"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Type</label>
              <select
                value={editingClient?.clientType || 'residential'}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, clientType: e.target.value as any }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="residential">Residential Homeowner</option>
                <option value="commercial">Commercial / Corporate</option>
                <option value="developer">Property Developer</option>
                <option value="subcontractor">Subcontractor / Partner</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Status</label>
              <select
                value={editingClient?.status || 'active'}
                onChange={(e) => setEditingClient((prev) => ({ ...prev, status: e.target.value as any }))}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="active">Active Contractor Client</option>
                <option value="lead">Prospective Lead</option>
                <option value="archived">Archived / Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes & Specifications</label>
            <textarea
              rows={3}
              value={editingClient?.notes || ''}
              onChange={(e) => setEditingClient((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Building specifications, delivery instructions, etc."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingClient(null);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              Save Client Changes
            </button>
          </div>
        </form>
      </Modal>
    </PortalShell>
  );
}
