'use client';

import React, { useState } from 'react';
import { PortalShell } from '@/components/layout/portal-shell';
import { DocumentScannerModal } from '@/components/documents/document-scanner-modal';
import {
  Sparkles,
  Scan,
  Upload,
  Camera,
  FileSpreadsheet,
  ReceiptText,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ScanPage() {
  const [scannerOpen, setScannerOpen] = useState(true);

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Banner Header */}
        <div className="bg-[#082B52] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D5A11E]/20 border border-[#D5A11E]/40 text-[#F1D681] rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Multimodal Document Extractor</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Scan Legacy Quotes, BOQs & Invoices into Vacanyi Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Snap a photo with your mobile camera or upload old supplier PDFs. Our AI engine extracts line items, quantities, rates, and client details with 1-tap database synchronization.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D5A11E] hover:bg-[#B38615] text-[#082B52] text-xs sm:text-sm font-black shadow-lg transition-all active:scale-95"
              >
                <Scan className="w-5 h-5 stroke-[2.5]" />
                <span>Launch Document Scanner</span>
              </button>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <Scan className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">BOQ Estimates</h3>
            <p className="text-xs text-slate-500">
              Converts handwritten or typed Bill of Quantities schedules into live editable estimates.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ReceiptText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Historical Invoices</h3>
            <p className="text-xs text-slate-500">
              Scans past drawdowns and bills to preserve your financial accounts history and debtor ledgers.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Client Profiles</h3>
            <p className="text-xs text-slate-500">
              Extracts employer contacts, site addresses, and WhatsApp numbers directly into your CRM.
            </p>
          </div>
        </div>
      </div>

      {/* Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </PortalShell>
  );
}
