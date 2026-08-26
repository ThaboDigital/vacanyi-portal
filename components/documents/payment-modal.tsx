'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Invoice, PaymentMethod } from '@/lib/types';
import { formatZAR } from '@/lib/utils/formatters';
import { DataStore } from '@/lib/storage/data-store';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { CreditCard, CheckCircle2, Share2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [amount, setAmount] = useState<number>(invoice?.balanceDue || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EFT');
  const [bankReference, setBankReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [createdReceipt, setCreatedReceipt] = useState<any>(null);

  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.balanceDue);
      setBankReference(invoice.paymentReference || invoice.invoiceNumber);
      setCreatedReceipt(null);
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    const { receipt } = DataStore.recordInvoicePayment(
      invoice.id,
      Number(amount),
      paymentMethod,
      bankReference,
      notes
    );

    setCreatedReceipt(receipt);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  const handleWhatsAppReceipt = () => {
    if (!createdReceipt) return;
    const client = DataStore.getClientById(invoice.clientId);
    const settings = DataStore.getSettings();
    if (!client) return;

    const message = WhatsAppShareService.createReceiptMessage(createdReceipt, client, settings);
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, message);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={createdReceipt ? 'Payment Receipt Issued!' : 'Record Payment / Drawdown'}
      subtitle={`Invoice #${invoice.invoiceNumber} — ${invoice.title}`}
      maxWidth="md"
    >
      {createdReceipt ? (
        <div className="space-y-5 text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900">
              {formatZAR(createdReceipt.amountPaid)} Logged Successfully
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Receipt No: <span className="font-bold text-[#082B52]">{createdReceipt.receiptNumber}</span>
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl text-left text-xs space-y-2 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-semibold">{createdReceipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bank Reference:</span>
              <span className="font-mono font-semibold text-[#082B52]">{createdReceipt.bankReference}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
              <span>Remaining Balance:</span>
              <span className="text-red-700">{formatZAR(createdReceipt.remainingProjectBalance)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleWhatsAppReceipt}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>1-Tap WhatsApp Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total Invoice Amount</p>
              <p className="text-sm font-bold text-[#082B52]">{formatZAR(invoice.totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Current Balance Due</p>
              <p className="text-sm font-bold text-red-700">{formatZAR(invoice.balanceDue)}</p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Amount Paid (ZAR) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">R</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                max={invoice.balanceDue}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              >
                <option value="EFT">EFT Transfer</option>
                <option value="Instant EFT">Instant EFT / Ozow / PayFast</option>
                <option value="Bank Deposit">Cash Bank Deposit</option>
                <option value="Card">Credit/Debit Card</option>
                <option value="Cash">Cash at Site</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Reference</label>
              <input
                type="text"
                value={bankReference}
                onChange={(e) => setBankReference(e.target.value)}
                placeholder="e.g. FNB-EFT-99120"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Cleared in FNB account; certified milestone 2 signoff."
              rows={2}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-[#D5A11E]" />
              <span>Confirm & Issue Receipt</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
