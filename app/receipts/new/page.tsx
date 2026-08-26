'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Client, Project, Invoice, PaymentMethod } from '@/lib/types';
import {
  ArrowLeft,
  FileCheck2,
  Save,
  CreditCard,
  Building,
} from 'lucide-react';
import { formatZAR } from '@/lib/utils/formatters';

function NewReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultClientId = searchParams.get('clientId') || '';

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Form State
  const [clientId, setClientId] = useState(defaultClientId);
  const [projectId, setProjectId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFT');
  const [bankReference, setBankReference] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('Milestone Progress Drawdown Payment');
  const [remainingProjectBalance, setRemainingProjectBalance] = useState<number>(0);
  const [receivedBy, setReceivedBy] = useState('Vacanyi Accounts Department');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const c = DataStore.getClients();
    const p = DataStore.getProjects();
    const inv = DataStore.getInvoices();
    setClients(c);
    setProjects(p);
    setInvoices(inv);

    if (!clientId && c.length > 0) {
      setClientId(c[0].id);
    }
  }, []);

  const handleClientChange = (id: string) => {
    setClientId(id);
    const clientProjects = projects.filter((p) => p.clientId === id);
    if (clientProjects.length > 0) {
      setProjectId(clientProjects[0].id);
    } else {
      setProjectId('');
    }
  };

  const handleInvoiceChange = (id: string) => {
    setInvoiceId(id);
    const selected = invoices.find((i) => i.id === id);
    if (selected) {
      setAmountPaid(selected.balanceDue);
      setBankReference(selected.paymentReference || selected.invoiceNumber);
      setMilestoneDescription(`Payment for ${selected.title}`);
      setRemainingProjectBalance(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || amountPaid <= 0) return;

    const receipt = DataStore.saveReceipt({
      clientId,
      projectId: projectId || undefined,
      invoiceId: invoiceId || undefined,
      paymentDate,
      amountPaid: Number(amountPaid),
      paymentMethod,
      bankReference,
      milestoneDescription,
      remainingProjectBalance: Number(remainingProjectBalance),
      receivedBy,
      notes,
    });

    router.push(`/receipts/${receipt.id}`);
  };

  return (
    <PortalShell>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/receipts"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#082B52] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Return to Receipts</span>
          </Link>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
          >
            <Save className="w-4 h-4 text-[#D5A11E]" />
            <span>Save & Generate Receipt PDF</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#082B52] tracking-tight">
              Issue Milestone Payment Receipt
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official payment acknowledgement receipt with bank reference and remaining contract balance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
              <label className="block font-bold text-slate-700 mb-1">Linked Invoice (Optional)</label>
              <select
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="">Select Invoice to Credit</option>
                {invoices
                  .filter((i) => !clientId || i.clientId === clientId)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNumber} — {i.title} ({formatZAR(i.balanceDue)} due)
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Amount Paid (ZAR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="e.g. 312500"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-[#082B52] focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              >
                <option value="EFT">EFT Bank Transfer</option>
                <option value="Instant EFT">Instant EFT</option>
                <option value="Bank Deposit">Cash Bank Deposit</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Cash">Cash at Site</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Transaction Reference</label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g. FNB-EFT-991024"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">
              Milestone Stage Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={milestoneDescription}
              onChange={(e) => setMilestoneDescription(e.target.value)}
              placeholder="e.g. Milestone 1: Site Mobilization & Concrete Foundation Slab Pour"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Remaining Contract Balance (ZAR)</label>
              <input
                type="number"
                step="0.01"
                value={remainingProjectBalance}
                onChange={(e) => setRemainingProjectBalance(Number(e.target.value))}
                placeholder="e.g. 625000"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Received & Certified By</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Receipt Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Cleared into Vacanyi FNB Cheque Account; receipt copy sent via WhatsApp."
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Link
              href="/receipts"
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-md"
            >
              Issue Receipt
            </button>
          </div>
        </div>
      </form>
    </PortalShell>
  );
}

export default function NewReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Receipt Form...</div>}>
      <NewReceiptContent />
    </Suspense>
  );
}

