'use client';

import React, { useState, useEffect } from 'react';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { CompanySettings } from '@/lib/types';
import { SignaturePad } from '@/components/ui/signature-pad';
import {
  Settings,
  Save,
  Building,
  CreditCard,
  FileText,
  ShieldCheck,
  Phone,
  Mail,
  RotateCcw,
  CheckCircle2,
  PenTool,
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(DataStore.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(DataStore.getSettings());
  }, []);

  const handleChange = (field: keyof CompanySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    DataStore.updateSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default sample contractor data? All changes will be reseeded.')) {
      DataStore.resetToDefaultData();
      setSettings(DataStore.getSettings());
      alert('Data reset successfully to default contractor portfolio.');
    }
  };

  return (
    <PortalShell>
      <form onSubmit={handleSave} className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">Company & Banking Settings</h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure contractor branding, FNB banking details for invoices, CIPC, SARS VAT, and NHBRC compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Changes Saved</span>
              </span>
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-md"
            >
              <Save className="w-4 h-4 text-[#D5A11E]" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </div>

        {/* 1. Company Profile & Compliance */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#082B52] text-[#D5A11E] flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#082B52]">Company Profile & Compliance</h3>
              <p className="text-xs text-slate-500">Official legal entity details printed on quotes & invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={settings.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Short Brand Name</label>
              <input
                type="text"
                required
                value={settings.shortName}
                onChange={(e) => handleChange('shortName', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">CIPC Registration Number</label>
              <input
                type="text"
                value={settings.registrationNumber}
                onChange={(e) => handleChange('registrationNumber', e.target.value)}
                placeholder="2023/894120/07"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SARS Tax / Income Tax Number</label>
              <input
                type="text"
                value={settings.taxNumber}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                placeholder="9821034821"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">NHBRC Registration Number</label>
              <input
                type="text"
                value={settings.nhbrcNumber}
                onChange={(e) => handleChange('nhbrcNumber', e.target.value)}
                placeholder="NHBRC-300029817"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">WhatsApp Phone (International format)</label>
              <input
                type="text"
                value={settings.whatsappPhone}
                onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                placeholder="27633437927"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Physical Business Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
            />
          </div>
        </div>

        {/* 2. Banking Details for Invoices */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#082B52]">Banking Details for EFT Payments</h3>
              <p className="text-xs text-slate-500">Rendered in the official payment box on all Tax Invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={settings.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="First National Bank (FNB)"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Name</label>
              <input
                type="text"
                value={settings.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
                placeholder="Vacanyi Building Construction (Pty) Ltd"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={settings.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="63098712345"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-[#082B52]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Branch Code</label>
              <input
                type="text"
                value={settings.branchCode}
                onChange={(e) => handleChange('branchCode', e.target.value)}
                placeholder="250655"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Type</label>
              <input
                type="text"
                value={settings.accountType}
                onChange={(e) => handleChange('accountType', e.target.value)}
                placeholder="Business Cheque Account"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">SWIFT Code</label>
              <input
                type="text"
                value={settings.swiftCode}
                onChange={(e) => handleChange('swiftCode', e.target.value)}
                placeholder="FIRNZAJJ"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* 3. Default Contractual Terms */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#082B52]">Default Terms & Conditions</h3>
              <p className="text-xs text-slate-500">Contractual stipulations appended to Quotations and Invoices</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Default Quotation Terms & Conditions
              </label>
              <textarea
                rows={6}
                value={settings.defaultQuoteTerms}
                onChange={(e) => handleChange('defaultQuoteTerms', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono leading-relaxed"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Default Invoice Payment Terms
              </label>
              <textarea
                rows={6}
                value={settings.defaultInvoiceTerms}
                onChange={(e) => handleChange('defaultInvoiceTerms', e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* 4. Official Contractor Digital Signature */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#082B52] text-[#D5A11E] flex items-center justify-center font-bold">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#082B52]">Contractor Official Signature</h3>
              <p className="text-xs text-slate-500">
                Draw or upload your company signature to automatically stamp Quotations, Invoices, Milestone Receipts & Handover Reports
              </p>
            </div>
          </div>

          <SignaturePad
            initialSignature={settings.signatureDataUrl || ''}
            signatoryName={settings.signatoryName || 'Vacanyi Project Lead'}
            signatoryTitle={settings.signatoryTitle || 'Authorized Builder & Contractor'}
            onSave={(signatureDataUrl, signatoryName, signatoryTitle) => {
              setSettings((prev) => ({
                ...prev,
                signatureDataUrl,
                signatoryName,
                signatoryTitle,
              }));
            }}
          />
        </div>

        {/* 5. Reset / Maintenance */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-800">Restore Contractor Seed Data</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Reset database to authentic Vacanyi Building construction projects, BOQ line items, and invoices.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </form>
    </PortalShell>
  );
}
