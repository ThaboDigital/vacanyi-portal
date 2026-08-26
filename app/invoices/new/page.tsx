'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Client, Project, InvoiceType, InvoiceItem } from '@/lib/types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ReceiptText,
  Save,
  CreditCard,
  Building,
} from 'lucide-react';
import { formatZAR } from '@/lib/utils/formatters';

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
  const [settings, setSettings] = useState(DataStore.getSettings());

  // Form State
  const [clientId, setClientId] = useState(defaultClientId);
  const [projectId, setProjectId] = useState(defaultProjectId);
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('progress_draw');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [retentionPercentage, setRetentionPercentage] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(15);
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState<FormItem[]>([
    {
      description: 'Milestone Progress Claim: Brickwork Superstructure to Wallplate Height.',
      unit: 'sum',
      quantity: 1,
      unitRate: 250000,
      totalAmount: 250000,
    },
  ]);

  useEffect(() => {
    const c = DataStore.getClients();
    const p = DataStore.getProjects();
    setClients(c);
    setProjects(p);

    if (!clientId && c.length > 0) {
      setClientId(c[0].id);
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
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
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
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
          >
            <Save className="w-4 h-4 text-[#D5A11E]" />
            <span>Issue & Generate Tax Invoice PDF</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
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
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.companyName ? `(${c.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Linked Construction Project</label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="">Standalone / No Linked Project</option>
                {projects
                  .filter((p) => !clientId || p.clientId === clientId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} — {p.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Invoice Type</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="progress_draw">Progress Drawdown Claim</option>
                <option value="deposit">Deposit & Mobilization Invoice</option>
                <option value="tax_invoice">Standard Tax Invoice</option>
                <option value="final">Final Handover Claim</option>
                <option value="variation">Variation Order Invoice</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Invoice Title / Milestone Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Progress Claim #2: Brickwork Superstructure to Wallplate Height"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">EFT Payment Reference</label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Auto-generated if blank (e.g. VAC-INV-001)"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Issue Date</label>
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

          {/* Line Items Table */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-[#082B52]">Invoice Line Items</h3>
                <p className="text-xs text-slate-500">Breakdown of work or milestone claims</p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#082B52] text-white text-[11px]">
                    <th className="p-2.5 font-bold">Description</th>
                    <th className="p-2.5 font-bold w-24 text-center">Unit</th>
                    <th className="p-2.5 font-bold w-24 text-right">Qty</th>
                    <th className="p-2.5 font-bold w-32 text-right">Rate (ZAR)</th>
                    <th className="p-2.5 font-bold w-32 text-right">Amount (ZAR)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <textarea
                          rows={2}
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. Milestone 2 Completion as certified by Structural Engineer on 25 June 2026."
                          className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-medium"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded text-center text-xs"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded text-right text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unitRate}
                          onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-300 rounded text-right text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2 align-top text-right font-bold text-slate-900 text-xs pt-3">
                        {formatZAR(item.totalAmount)}
                      </td>
                      <td className="p-2 align-top text-center pt-2.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-80 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Subtotal:</span>
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
                <span className="font-bold text-red-700">-{formatZAR(retentionAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">VAT:</span>
                  <select
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(Number(e.target.value))}
                    className="p-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                  >
                    <option value={15}>15% (Standard VAT)</option>
                    <option value={0}>0% (Non-VAT)</option>
                  </select>
                </div>
                <span className="font-bold text-slate-900">{formatZAR(vatAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-[#082B52] pt-2 border-t-2 border-slate-300">
                <span>TOTAL INVOICE:</span>
                <span className="text-base text-[#082B52]">{formatZAR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="text-xs pt-4 border-t border-slate-200">
            <label className="block font-bold text-slate-700 mb-1">Invoice Notes / Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Certified by Ingwe Structural Engineers on 25 June 2026."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
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
              <Save className="w-4 h-4 text-[#D5A11E]" />
              <span>Save & View Invoice PDF</span>
            </button>
          </div>
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

