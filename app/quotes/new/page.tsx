'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Client, BOQCategory, QuoteItem } from '@/lib/types';
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileSpreadsheet,
  Save,
  Share2,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { formatZAR } from '@/lib/utils/formatters';

const BOQ_CATEGORIES: BOQCategory[] = [
  'Preliminaries & Site Setup',
  'Earthworks & Excavation',
  'Concrete & Foundation',
  'Masonry & Brickwork',
  'Roofing & Timber Trusses',
  'Plumbing & Drainage',
  'Electrical & Lighting',
  'Plastering & Ceilings',
  'Flooring & Tiling',
  'Painting & Finishes',
  'Doors, Windows & Glazing',
  'External Works & Paving',
  'Sundries & Contingency',
];

const UNITS = ['m²', 'm³', 'lm', 'nr', 'sum', 'hrs', 'bags', 'loads', 'items'];

interface FormItem {
  id?: string;
  category: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalAmount: number;
}

function NewQuoteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get('clientId') || '';

  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState(DataStore.getSettings());

  // Form State
  const [clientId, setClientId] = useState(defaultClientId);
  const [title, setTitle] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [paymentScheduleTerms, setPaymentScheduleTerms] = useState(
    '• 30% Deposit & Mobilization\n• 30% Superstructure Brickwork to Wallplate\n• 25% Roof Installation & Plastering\n• 15% Finishes & Practical Handover'
  );
  const [specialNotes, setSpecialNotes] = useState(
    'All works executed strictly according to NHBRC and SANS 10400 standards. 12-month structural guarantee.'
  );
  const [discountAmount, setDiscountAmount] = useState(0);
  const [vatPercentage, setVatPercentage] = useState(15);

  // Line items
  const [items, setItems] = useState<FormItem[]>([
    {
      category: 'Preliminaries & Site Setup',
      description: 'Site establishment, safety setup, water connection and NHBRC compliance.',
      unit: 'sum',
      quantity: 1,
      unitRate: 35000,
      totalAmount: 35000,
    },
    {
      category: 'Concrete & Foundation',
      description: 'Excavation of strip footings and 30MPa reinforced concrete foundation slab.',
      unit: 'm²',
      quantity: 150,
      unitRate: 850,
      totalAmount: 127500,
    },
    {
      category: 'Masonry & Brickwork',
      description: 'Double cavity brickwork to wallplate height with lintels and damp proof coursing.',
      unit: 'm²',
      quantity: 380,
      unitRate: 420,
      totalAmount: 159600,
    },
  ]);

  useEffect(() => {
    const c = DataStore.getClients();
    setClients(c);
    if (!clientId && c.length > 0) {
      setClientId(c[0].id);
      setSiteAddress(c[0].physicalAddress || '');
    }
  }, []);

  const handleClientChange = (id: string) => {
    setClientId(id);
    const selected = clients.find((c) => c.id === id);
    if (selected && selected.physicalAddress) {
      setSiteAddress(selected.physicalAddress);
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

  const handleAddItem = (category: string = 'Masonry & Brickwork') => {
    setItems([
      ...items,
      {
        category,
        description: '',
        unit: 'm²',
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
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const vatAmount = vatPercentage > 0 ? (taxableAmount * vatPercentage) / 100 : 0;
  const totalAmount = taxableAmount + vatAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientId) return;

    const saved = DataStore.saveQuote(
      {
        clientId,
        title,
        siteAddress,
        issueDate,
        expiryDate,
        status: 'sent',
        subtotal,
        discountAmount,
        vatPercentage,
        vatAmount,
        totalAmount,
        scopeOfWork,
        paymentScheduleTerms,
        specialNotes,
      },
      items
    );

    router.push(`/quotes/${saved.id}`);
  };

  return (
    <PortalShell>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/quotes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return to Quotes</span>
          </Link>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
          >
            <Save className="w-4 h-4 text-[#D5A11E]" />
            <span>Save & Generate Quote PDF</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#082B52] tracking-tight">
              Create BOQ Quotation / Tender Proposal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Bill of Quantities with trade grouping, unit rates, VAT calculations, and milestone schedules.
            </p>
          </div>

          {/* Client & Project Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Client <span className="text-red-500">*</span>
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
              <label className="block font-bold text-slate-700 mb-1">
                Quotation Title / Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Turnkey Residential 4-Bedroom Construction"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Site Location / Physical Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={siteAddress}
                onChange={(e) => setSiteAddress(e.target.value)}
                placeholder="e.g. 12 Acacia Drive, Sterpark, Polokwane"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <label className="block font-bold text-slate-700 mb-1">Validity Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Scope of Work */}
          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Scope of Work Overview</label>
            <textarea
              rows={3}
              value={scopeOfWork}
              onChange={(e) => setScopeOfWork(e.target.value)}
              placeholder="e.g. Supply of materials and labor for complete construction from excavation, concrete footing, brickwork, roofing, electrical reticulation, plumbing, to handover."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          {/* Bill of Quantities (BOQ) Table */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-[#082B52]">Bill of Quantities (BOQ) Items</h3>
                <p className="text-xs text-slate-500">Add detailed trade items with rates and quantities</p>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#082B52] text-white text-[11px]">
                    <th className="p-2.5 font-bold w-48">Trade Category</th>
                    <th className="p-2.5 font-bold">Item Description</th>
                    <th className="p-2.5 font-bold w-20 text-center">Unit</th>
                    <th className="p-2.5 font-bold w-24 text-right">Qty</th>
                    <th className="p-2.5 font-bold w-28 text-right">Rate (R)</th>
                    <th className="p-2.5 font-bold w-28 text-right">Total (R)</th>
                    <th className="p-2.5 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2 align-top">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px] font-semibold text-[#082B52]"
                        >
                          {BOQ_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 align-top">
                        <textarea
                          rows={2}
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          placeholder="e.g. 150mm 30MPa reinforced concrete floor slab with Ref 245 mesh"
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-medium"
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
                          step="0.01"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-right text-xs font-semibold"
                        />
                      </td>
                      <td className="p-2 align-top">
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={item.unitRate}
                          onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded text-right text-xs font-semibold"
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
                          title="Remove Row"
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
                <span className="font-semibold">BOQ Subtotal:</span>
                <span className="font-bold text-slate-900">{formatZAR(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="font-semibold">Discount (ZAR):</span>
                <input
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  className="w-24 p-1 bg-white border border-slate-300 rounded text-right text-xs font-bold"
                />
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">VAT:</span>
                  <select
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(Number(e.target.value))}
                    className="p-1 bg-white border border-slate-300 rounded text-xs font-semibold"
                  >
                    <option value={15}>15% (Standard SARS VAT)</option>
                    <option value={0}>0% (Non-VAT Registered)</option>
                  </select>
                </div>
                <span className="font-bold text-slate-900">{formatZAR(vatAmount)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-black text-[#082B52] pt-2 border-t-2 border-slate-300">
                <span>TOTAL QUOTE:</span>
                <span className="text-base text-[#082B52]">{formatZAR(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Milestone Schedule & Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Milestone Drawdown Schedule
              </label>
              <textarea
                rows={4}
                value={paymentScheduleTerms}
                onChange={(e) => setPaymentScheduleTerms(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Special Notes & Specifications
              </label>
              <textarea
                rows={4}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/quotes"
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-md"
            >
              <CheckCircle2 className="w-4 h-4 text-[#D5A11E]" />
              <span>Save & View Live Quotation PDF</span>
            </button>
          </div>
        </div>
      </form>
    </PortalShell>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Quote Builder...</div>}>
      <NewQuoteContent />
    </Suspense>
  );
}

