'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Client, Project, InvoiceType } from '@/lib/types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ReceiptText,
  Save,
  Building,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { formatZAR } from '@/lib/utils/formatters';

const UNITS = ['sum', 'm²', 'm³', 'lm', 'Unit', 'Bag', 'Roll', 'Length', 'Sheet', 'kg', 'hrs', 'loads', 'items'];

interface FormItem {
  id?: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
}

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get('clientId') || '';
  const defaultProjectId = searchParams.get('projectId') || '';

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Form State - Clean initial state with zero dummy data
  const [clientId, setClientId] = useState(defaultClientId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('progress_draw');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [retentionPercentage, setRetentionPercentage] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(0);
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  // Items - Start with 1 clean blank item
  const [items, setItems] = useState<FormItem[]>([
    {
      description: '',
      unit: 'sum',
      quantity: 1,
      unitRate: 0,
      totalAmount: 0,
    },
  ]);

  useEffect(() => {
    const c = DataStore.getClients();
    const p = DataStore.getProjects();
    setClients(c);
    setProjects(p);

    if (!clientId && c.length > 0) {
      setClientId(c[0].id);
      const clientProjects = p.filter((prj) => prj.clientId === c[0].id);
      if (clientProjects.length > 0) {
        setProjectId(clientProjects[0].id);
        setTitle(`Tax Invoice: ${clientProjects[0].title}`);
      }
    }
  }, []);

  const handleClientChange = (id: string) => {
    setClientId(id);
    const clientProjects = projects.filter((p) => p.clientId === id);
    if (clientProjects.length > 0) {
      setProjectId(clientProjects[0].id);
      setTitle(`Progress Claim: ${clientProjects[0].title}`);
    } else {
      setProjectId('');
    }
  };

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const selected = projects.find((p) => p.id === id);
    if (selected) {
      setTitle(`Progress Claim: ${selected.title}`);
    }
  };

  const handleItemChange = (index: number, field: keyof FormItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitRate') {
      const q = field === 'quantity' ? Number(value) : updated[index].quantity;
      const r = field === 'unitRate' ? Number(value) : updated[index].unitRate;
      updated[index].totalAmount = (Number(q) || 0) * (Number(r) || 0);
    }

    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: '',
        unit: 'sum',
        quantity: 1,
        unitRate: 0,
        totalAmount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  const retentionAmount = retentionPercentage > 0 ? (subtotal * retentionPercentage) / 100 : 0;
  const billableSubtotal = Math.max(0, subtotal - retentionAmount);
  const vatAmount = vatPercentage > 0 ? (billableSubtotal * vatPercentage) / 100 : 0;
  const totalAmount = billableSubtotal + vatAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;

    const saved = DataStore.saveInvoice(
      {
        clientId,
        projectId: projectId || undefined,
        invoiceType,
        title,
        issueDate,
        dueDate,
        status: 'issued',
        retentionPercentage,
        vatPercentage,
        paymentReference: paymentReference || undefined,
        notes,
      },
      items
    );

    router.push(`/invoices/${saved.id}`);
  };

  return (
    <PortalShell>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-24 md:pb-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return to Invoices</span>
          </Link>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <Save className="w-4 h-4 text-[#D5A11E]" />
            <span>Issue & Generate Tax Invoice PDF</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#082B52] tracking-tight">
              Create Tax Invoice / Progress Claim
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Issue certified milestone draws, apply retention deductions, and set banking payment terms.
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20"
              >
                {clients.length === 0 && <option value="">No registered clients yet</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Associated Site Project</label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20"
              >
                <option value="">-- No project link (Direct Billing) --</option>
                {projects
                  .filter((p) => p.clientId === clientId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.projectCode})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Billing Type</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20"
              >
                <option value="progress_draw">Milestone Progress Drawdown</option>
                <option value="tax_invoice">Standard Tax Invoice</option>
                <option value="deposit">Commencement Deposit</option>
                <option value="variation_order">Variation Order (VO) Claim</option>
                <option value="final_claim">Final Account & Retention Release</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Invoice Title / Milestone Claim Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Drawdown 1: Foundation Slab Casting & Earthworks"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Payment Reference</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. MASH-DRAW-01"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[#082B52]">
                  Invoice Line Items & Certified Progress ({items.length})
                </h3>
                <p className="text-[11px] text-slate-500">Breakdown of work or materials claimed</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#082B52]/10 hover:bg-[#082B52]/20 text-[#082B52] text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 text-[#D5A11E]" />
                <span>Add Item</span>
              </button>
            </div>

            {/* MOBILE VIEW (< 768px): Responsive Touch Cards */}
            <div className="block md:hidden space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3 relative shadow-2xs"
                >
                  {/* Header & Delete */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase text-[#082B52] tracking-wider">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg shrink-0"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      placeholder="e.g. Milestone 1: Concrete footing and foundation casting"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  {/* 3-Column Grid: Qty, Unit, Rate */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                        Qty
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                        Unit
                      </label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-center"
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                        Rate (ZAR)
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={item.unitRate}
                        onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-right"
                      />
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Line Amount:</span>
                    <span className="font-black text-[#082B52] text-sm">
                      {formatZAR(item.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW (>= 768px): Dense Spreadsheet Table */}
            <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#082B52] text-white text-[11px]">
                    <th className="p-2.5 font-bold">Item / Progress Claim Description</th>
                    <th className="p-2.5 font-bold w-24 text-center">Unit</th>
                    <th className="p-2.5 font-bold w-20 text-right">Qty</th>
                    <th className="p-2.5 font-bold w-24 text-right">Rate (R)</th>
                    <th className="p-2.5 font-bold w-28 text-right">Total (R)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Milestone 1: Concrete footing and foundation casting"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-center text-xs font-semibold"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          step="any"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-right text-xs font-bold"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          step="any"
                          required
                          value={item.unitRate}
                          onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-right text-xs font-bold"
                        />
                      </td>
                      <td className="p-2 align-top text-right font-bold text-slate-900 text-xs pt-2.5">
                        {formatZAR(item.totalAmount)}
                      </td>
                      <td className="p-2 align-top text-center pt-2">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="Remove Row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Gross Claim Subtotal:</span>
                <span className="font-bold text-slate-900">{formatZAR(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Retention:</span>
                  <select
                    value={retentionPercentage}
                    onChange={(e) => setRetentionPercentage(Number(e.target.value))}
                    className="p-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                  >
                    <option value={0}>0% (No Retention)</option>
                    <option value={5}>5% Retention</option>
                    <option value={10}>10% Retention</option>
                  </select>
                </div>
                <span className="font-bold text-red-600">
                  {retentionAmount > 0 ? `-${formatZAR(retentionAmount)}` : 'R 0.00'}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">VAT:</span>
                  <select
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(Number(e.target.value))}
                    className="p-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                  >
                    <option value={0}>0% (Non-VAT Registered)</option>
                    <option value={15}>15% (Standard SARS VAT)</option>
                  </select>
                </div>
                <span className="font-bold text-slate-900">{formatZAR(vatAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-[#082B52] pt-2 border-t-2 border-slate-300">
                <span>INVOICE TOTAL DUE:</span>
                <span className="text-base text-[#082B52]">{formatZAR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Terms & Notes */}
          <div className="text-xs pt-4 border-t border-slate-200">
            <label className="block font-bold text-slate-700 mb-1">
              Banking Payment Instructions & Compliance Notes
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please use project code or invoice number as payment reference. Proof of payment to info@vacanyi.co.za"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Desktop Submit Button */}
          <div className="hidden sm:flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/invoices"
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D5A11E]" />
              <span>Issue & View Tax Invoice PDF</span>
            </button>
          </div>
        </div>

        {/* STICKY MOBILE BOTTOM BAR (on phones only) */}
        <div className="sm:hidden fixed bottom-16 inset-x-0 z-30 bg-[#082B52] text-white p-3 border-t border-white/20 shadow-2xl flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] text-[#D5A11E] uppercase font-bold tracking-wider block">
              Invoice Due
            </span>
            <p className="text-base font-black text-white truncate">{formatZAR(totalAmount)}</p>
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#D5A11E] hover:bg-[#B38615] text-[#082B52] font-black text-xs shadow-md shrink-0 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </form>
    </PortalShell>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Invoice Builder...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
}
