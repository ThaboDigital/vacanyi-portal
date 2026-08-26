'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Scan,
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Building,
  User,
  Phone,
  MapPin,
} from 'lucide-react';
import { DataStore } from '@/lib/storage/data-store';
import { formatZAR } from '@/lib/utils/formatters';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentScannerModal({ isOpen, onClose }: DocumentScannerModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<'upload' | 'review' | 'success'>('upload');
  const [error, setError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Extracted Data Form State
  const [docType, setDocType] = useState<'quote' | 'invoice' | 'receipt' | 'client'>('quote');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [email, setEmail] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');

  const [projectTitle, setProjectTitle] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [siteAddress, setSiteAddress] = useState('');

  const [items, setItems] = useState<
    Array<{
      category: string;
      description: string;
      unit: string;
      quantity: number;
      unitRate: number;
      totalAmount: number;
    }>
  >([]);

  const [vatPercentage, setVatPercentage] = useState<number>(0);
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [paymentScheduleTerms, setPaymentScheduleTerms] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/scan-document', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze document');
      }

      const d = json.data;
      setDocType(d.documentType || 'quote');
      setReferenceNumber(d.referenceNumber || '');
      setIssueDate(d.issueDate || new Date().toISOString().split('T')[0]);
      setExpiryDate(d.expiryDate || '');
      setDueDate(d.dueDate || '');

      setClientName(d.client?.name || '');
      setCompanyName(d.client?.companyName || '');
      setPhone(d.client?.phone || '');
      setWhatsappPhone(d.client?.whatsappPhone || '');
      setEmail(d.client?.email || '');
      setPhysicalAddress(d.client?.physicalAddress || '');

      setProjectTitle(d.project?.title || '');
      setProjectCode(d.project?.projectCode || '');
      setSiteAddress(d.project?.siteAddress || d.client?.physicalAddress || '');

      setItems(d.items || []);
      setVatPercentage(d.vatPercentage !== undefined ? d.vatPercentage : 0);
      setScopeOfWork(d.scopeOfWork || '');
      setPaymentScheduleTerms(d.paymentScheduleTerms || '');
      setNotes(d.notes || '');

      setScanStep('review');
    } catch (err: any) {
      setError(err?.message || 'Error occurred during AI document scanning');
    } finally {
      setIsScanning(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'unitRate') {
        const q = field === 'quantity' ? Number(value) : next[index].quantity;
        const r = field === 'unitRate' ? Number(value) : next[index].unitRate;
        next[index].totalAmount = Number((q * r).toFixed(2));
      }
      return next;
    });
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        category: 'Concrete & Foundation',
        description: 'New material or labor item',
        unit: 'Unit',
        quantity: 1,
        unitRate: 0,
        totalAmount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const calculatedSubtotal = items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
  const calculatedVat = (calculatedSubtotal * vatPercentage) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedVat;

  const handleSyncToPortal = () => {
    if (!clientName || !phone) {
      setError('Please provide at least client name and phone number to sync.');
      return;
    }

    try {
      // 1. Save or Update Client
      const existingClients = DataStore.getClients();
      let targetClient = existingClients.find(
        (c) => c.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, '') || c.name.toLowerCase() === clientName.toLowerCase()
      );

      if (targetClient) {
        targetClient = DataStore.saveClient({
          ...targetClient,
          name: clientName,
          companyName,
          phone,
          whatsappPhone: whatsappPhone || phone.replace(/[^0-9]/g, ''),
          email,
          physicalAddress,
        });
      } else {
        targetClient = DataStore.saveClient({
          name: clientName,
          companyName,
          phone,
          whatsappPhone: whatsappPhone || phone.replace(/[^0-9]/g, ''),
          email,
          physicalAddress,
          clientType: 'residential',
          status: 'active',
          notes: notes || `Scanned from legacy paper quote/invoice ${referenceNumber}`,
        });
      }

      // 2. Save Project if specified
      let targetProject = DataStore.getProjects().find(
        (p) => p.clientId === targetClient!.id || (projectTitle && p.title.toLowerCase() === projectTitle.toLowerCase())
      );

      if (!targetProject && projectTitle) {
        targetProject = DataStore.saveProject({
          clientId: targetClient.id,
          title: projectTitle,
          projectCode: projectCode || `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          siteAddress: siteAddress || physicalAddress,
          contractValue: calculatedTotal,
          status: 'in_progress',
          progressPercentage: 50,
          notes: scopeOfWork,
        });
      }

      // 3. Save Document (Quote / Invoice)
      if (docType === 'quote') {
        DataStore.saveQuote(
          {
            clientId: targetClient.id,
            projectId: targetProject?.id,
            quoteNumber: referenceNumber || `VB-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            title: projectTitle || `BOQ Estimate - ${clientName}`,
            siteAddress: siteAddress || physicalAddress,
            issueDate: issueDate || new Date().toISOString().split('T')[0],
            expiryDate: expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'accepted',
            subtotal: calculatedSubtotal,
            vatPercentage,
            vatAmount: calculatedVat,
            totalAmount: calculatedTotal,
            scopeOfWork,
            paymentScheduleTerms,
            specialNotes: notes,
          },
          items.map((it, idx) => ({
            id: `qi-scn-${Date.now()}-${idx}`,
            orderIndex: idx + 1,
            category: it.category,
            description: it.description,
            unit: it.unit,
            quantity: it.quantity,
            unitRate: it.unitRate,
            totalAmount: it.totalAmount,
          }))
        );
      } else if (docType === 'invoice') {
        DataStore.saveInvoice(
          {
            clientId: targetClient.id,
            projectId: targetProject?.id,
            invoiceNumber: referenceNumber || `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            invoiceType: 'tax_invoice',
            title: projectTitle || `Tax Invoice - ${clientName}`,
            issueDate: issueDate || new Date().toISOString().split('T')[0],
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'issued',
            subtotal: calculatedSubtotal,
            vatPercentage,
            vatAmount: calculatedVat,
            totalAmount: calculatedTotal,
            amountPaid: 0,
            balanceDue: calculatedTotal,
            paymentReference: referenceNumber,
            notes,
          },
          items.map((it, idx) => ({
            id: `ii-scn-${Date.now()}-${idx}`,
            orderIndex: idx + 1,
            description: it.description,
            unit: it.unit,
            quantity: it.quantity,
            unitRate: it.unitRate,
            totalAmount: it.totalAmount,
          }))
        );
      }

      setSyncSuccessMessage(
        `Successfully synced ${clientName} and ${docType.toUpperCase()} ${referenceNumber} into portal!`
      );
      setScanStep('success');
    } catch (err: any) {
      setError(err?.message || 'Failed to save scanned data');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div className="relative z-10 w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-[#082B52] text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D5A11E] text-[#082B52] flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  AI Document Scanner & OCR Importer
                </h3>
                <p className="text-xs text-slate-300">
                  Scan legacy quotes, bills & invoices into Vacanyi Portal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: UPLOAD & SCAN */}
            {scanStep === 'upload' && (
              <div className="space-y-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#082B52] bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all space-y-4"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mx-auto text-[#082B52]">
                    {selectedFile ? <FileText className="w-8 h-8 text-[#D5A11E]" /> : <Upload className="w-8 h-8" />}
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      {selectedFile ? selectedFile.name : 'Click to Upload or Drag & Drop Document'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDFs, phone photos of paper quotes, scanned contractor bills (PNG, JPG, PDF)
                    </p>
                  </div>

                  {selectedFile && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready to scan ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    </span>
                  )}
                </div>

                {/* Scan Trigger Button */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile || isScanning}
                    onClick={handleStartScan}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D5A11E]" />
                        <span>Analyzing Document with AI...</span>
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 text-[#D5A11E]" />
                        <span>Run AI OCR Scanner</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: REVIEW & VERIFICATION */}
            {scanStep === 'review' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D5A11E] shrink-0" />
                    <span>
                      <strong>AI Extraction Complete:</strong> Review extracted client info, BOQ line items, and totals before syncing.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanStep('upload')}
                    className="text-xs font-bold text-amber-800 hover:underline shrink-0"
                  >
                    Rescan Another
                  </button>
                </div>

                {/* Form Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Document Type & Reference */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as any)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    >
                      <option value="quote">Quotation (BOQ Estimate)</option>
                      <option value="invoice">Tax Invoice</option>
                      <option value="receipt">Payment Receipt</option>
                      <option value="client">Client Contact Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Document / Quote Ref #</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="e.g. VB-2026-021"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Client Information */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-[#082B52] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Client / Employer Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Client Full Name</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. M E N Mashatole"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +27 73 368 2204"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">WhatsApp Number</label>
                      <input
                        type="text"
                        value={whatsappPhone}
                        onChange={(e) => setWhatsappPhone(e.target.value)}
                        placeholder="e.g. 27733682204"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. client@example.co.za"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5">Physical / Site Address</label>
                    <input
                      type="text"
                      value={physicalAddress}
                      onChange={(e) => setPhysicalAddress(e.target.value)}
                      placeholder="e.g. Tickiline Village, Tzaneen, Limpopo, 0850"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Project Information */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-[#082B52] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    <span>Project & Site Details</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Project Title</label>
                      <input
                        type="text"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        placeholder="e.g. Mashatole Residential Building Project"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-600 mb-0.5">Project Ref Code</label>
                      <input
                        type="text"
                        value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value)}
                        placeholder="e.g. MASH-TZN-0826"
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px]">
                      Extracted Materials & Line Items ({items.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 text-[#082B52] hover:text-[#D5A11E] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#082B52] text-white text-[11px]">
                            <th className="p-2.5 font-bold">Category</th>
                            <th className="p-2.5 font-bold">Description</th>
                            <th className="p-2.5 font-bold text-center">Unit</th>
                            <th className="p-2.5 font-bold text-right">Qty</th>
                            <th className="p-2.5 font-bold text-right">Rate (ZAR)</th>
                            <th className="p-2.5 font-bold text-right">Amount</th>
                            <th className="p-2.5 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.category}
                                  onChange={(e) => handleItemChange(idx, 'category', e.target.value)}
                                  className="w-28 p-1 border border-slate-200 rounded text-[11px]"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                  className="w-full p-1 border border-slate-200 rounded text-[11px] font-medium"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                  className="w-16 p-1 border border-slate-200 rounded text-center text-[11px]"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                  className="w-16 p-1 border border-slate-200 rounded text-right text-[11px]"
                                />
                              </td>
                              <td className="p-2 text-right">
                                <input
                                  type="number"
                                  value={item.unitRate}
                                  onChange={(e) => handleItemChange(idx, 'unitRate', e.target.value)}
                                  className="w-20 p-1 border border-slate-200 rounded text-right text-[11px]"
                                />
                              </td>
                              <td className="p-2 text-right font-bold text-[#082B52]">
                                {formatZAR(item.totalAmount)}
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-bold">{formatZAR(calculatedSubtotal)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>VAT Rate:</span>
                      <select
                        value={vatPercentage}
                        onChange={(e) => setVatPercentage(Number(e.target.value))}
                        className="p-1 bg-white border border-slate-300 rounded text-xs"
                      >
                        <option value={0}>0% (Non-VAT)</option>
                        <option value={15}>15% Standard VAT</option>
                      </select>
                    </div>

                    {vatPercentage > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>VAT (15%):</span>
                        <span>{formatZAR(calculatedVat)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm font-bold text-[#082B52] pt-2 border-t border-slate-300">
                      <span>TOTAL SUM:</span>
                      <span className="text-base text-[#082B52]">{formatZAR(calculatedTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setScanStep('upload')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Back to Upload
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncToPortal}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>1-Tap Sync to Vacanyi Portal</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUCCESS CONFIRMATION */}
            {scanStep === 'success' && (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Document Synced Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">{syncSuccessMessage}</p>

                <div className="flex justify-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setScanStep('upload');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Scan Another Document
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(docType === 'invoice' ? '/invoices' : '/quotes');
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold shadow-xs"
                  >
                    <span>View Records in Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D5A11E]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
