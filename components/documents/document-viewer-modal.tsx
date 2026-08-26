'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Printer,
  Download,
  Share2,
  Mail,
  CheckCircle2,
  Building2,
  X,
  FileText,
  Calendar,
  CreditCard,
  HardHat,
} from 'lucide-react';
import { Quote, Invoice, MilestoneReceipt, Client, Project, CompanySettings } from '@/lib/types';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { PDFGeneratorService } from '@/lib/pdf/pdf-generator';
import { WhatsAppShareService } from '@/lib/share/whatsapp';
import { EmailShareService } from '@/lib/share/email';

type DocumentType = 'quote' | 'invoice' | 'receipt' | 'statement' | 'project_report';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType;
  quote?: Quote;
  invoice?: Invoice;
  receipt?: MilestoneReceipt;
  client?: Client;
  project?: Project;
  settings: CompanySettings;
  statementData?: {
    invoices: Invoice[];
    receipts: MilestoneReceipt[];
    totalInvoiced: number;
    totalPaid: number;
    balanceDue: number;
  };
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  documentType,
  quote,
  invoice,
  receipt,
  client,
  project,
  settings,
  statementData,
}: DocumentViewerModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const documentElementId = `vacanyi-doc-preview-${documentType}`;

  if (!isOpen) return null;

  const getDocumentTitle = () => {
    switch (documentType) {
      case 'quote':
        return `Quotation ${quote?.quoteNumber || ''}`;
      case 'invoice':
        return `Tax Invoice ${invoice?.invoiceNumber || ''}`;
      case 'receipt':
        return `Payment Receipt ${receipt?.receiptNumber || ''}`;
      case 'statement':
        return `Statement of Account - ${client?.name || ''}`;
      case 'project_report':
        return `Project Milestone Report - ${project?.projectCode || ''}`;
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    const filename = `${getDocumentTitle().replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`;
    await PDFGeneratorService.exportElementToPDF(documentElementId, filename);
    setIsGenerating(false);
  };

  const handlePrint = () => {
    PDFGeneratorService.printElement(documentElementId);
  };

  const handleWhatsAppShare = () => {
    if (!client) return;
    let message = '';
    if (documentType === 'quote' && quote) {
      message = WhatsAppShareService.createQuoteMessage(quote, client, settings);
    } else if (documentType === 'invoice' && invoice) {
      message = WhatsAppShareService.createInvoiceMessage(invoice, client, settings);
    } else if (documentType === 'receipt' && receipt) {
      message = WhatsAppShareService.createReceiptMessage(receipt, client, settings);
    } else if (documentType === 'statement' && statementData) {
      message = WhatsAppShareService.createStatementMessage(
        client,
        statementData.totalInvoiced,
        statementData.totalPaid,
        statementData.balanceDue,
        settings
      );
    } else if (documentType === 'project_report' && project) {
      message = WhatsAppShareService.createMilestoneUpdateMessage(project, client, settings);
    }
    WhatsAppShareService.openWhatsApp(client.whatsappPhone || client.phone, message);
  };

  const handleEmailShare = () => {
    if (!client) return;
    if (documentType === 'quote' && quote) {
      EmailShareService.sendQuoteEmail(quote, client, settings);
    } else if (documentType === 'invoice' && invoice) {
      EmailShareService.sendInvoiceEmail(invoice, client, settings);
    } else if (documentType === 'receipt' && receipt) {
      EmailShareService.sendReceiptEmail(receipt, client, settings);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Action Header Bar */}
        <div className="bg-[#082B52] text-white px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D5A11E] text-[#082B52] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white tracking-wide">{getDocumentTitle()}</h3>
              <p className="text-[10px] text-slate-300">Vacanyi Document Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 1-Tap WhatsApp Button */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              title="Share via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1-Tap WhatsApp</span>
            </button>

            {/* 1-Tap Email Button */}
            <button
              onClick={handleEmailShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              title="Share via Email"
            >
              <Mail className="w-3.5 h-3.5 text-[#F1D681]" />
              <span className="hidden sm:inline">Email</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D5A11E] hover:bg-[#B38615] text-[#082B52] text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70 flex justify-center">
          <div
            id={documentElementId}
            className="w-full max-w-[800px] bg-white border border-slate-200 rounded-lg p-8 sm:p-12 shadow-sm text-slate-800"
            style={{ minHeight: '1050px' }}
          >
            {/* Header: Brand and Company Details */}
            <div className="flex justify-between items-start border-b-2 border-[#082B52] pb-6">
              <div>
                <div className="mb-3">
                  <Image
                    src="/brand/vacanyi-logo-default.png"
                    alt="Vacanyi Building Construction & Project"
                    width={220}
                    height={60}
                    unoptimized
                    className="h-14 w-auto object-contain"
                    priority
                  />
                </div>
                <div className="mt-2 text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800">{settings.companyName}</p>
                  <p>{settings.address}</p>
                  <p>
                    Tel / WhatsApp: <span className="font-semibold text-[#082B52]">{settings.phone}</span> | Email: {settings.email}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    CIPC Reg: {settings.registrationNumber} | VAT: {settings.vatNumber} | NHBRC Reg: {settings.nhbrcNumber}
                  </p>
                </div>
              </div>

              {/* Document Type Badge */}
              <div className="text-right">
                <div className="inline-block bg-[#082B52] text-[#F1D681] px-4 py-1.5 rounded-sm text-sm font-black uppercase tracking-widest">
                  {documentType === 'quote' && 'PROJECT QUOTATION'}
                  {documentType === 'invoice' && 'TAX INVOICE'}
                  {documentType === 'receipt' && 'OFFICIAL RECEIPT'}
                  {documentType === 'statement' && 'CLIENT STATEMENT'}
                  {documentType === 'project_report' && 'MILESTONE REPORT'}
                </div>
                <div className="mt-3 text-right text-xs">
                  {documentType === 'quote' && quote && (
                    <>
                      <p className="font-bold text-slate-900 text-sm">{quote.quoteNumber}</p>
                      <p className="text-slate-500">Date: {formatDate(quote.issueDate)}</p>
                      <p className="text-slate-500">Valid Until: {formatDate(quote.expiryDate)}</p>
                    </>
                  )}
                  {documentType === 'invoice' && invoice && (
                    <>
                      <p className="font-bold text-slate-900 text-sm">{invoice.invoiceNumber}</p>
                      <p className="text-slate-500">Date: {formatDate(invoice.issueDate)}</p>
                      <p className="text-red-700 font-semibold">Due: {formatDate(invoice.dueDate)}</p>
                      <p className="text-slate-500">Ref: {invoice.paymentReference}</p>
                    </>
                  )}
                  {documentType === 'receipt' && receipt && (
                    <>
                      <p className="font-bold text-slate-900 text-sm">{receipt.receiptNumber}</p>
                      <p className="text-slate-500">Payment Date: {formatDate(receipt.paymentDate)}</p>
                      <p className="text-slate-500">Method: {receipt.paymentMethod}</p>
                    </>
                  )}
                  {documentType === 'statement' && (
                    <>
                      <p className="font-bold text-slate-900 text-sm">Statement Date</p>
                      <p className="text-slate-500">{formatDate(new Date().toISOString())}</p>
                    </>
                  )}
                  {documentType === 'project_report' && project && (
                    <>
                      <p className="font-bold text-slate-900 text-sm">{project.projectCode}</p>
                      <p className="text-slate-500">Date: {formatDate(new Date().toISOString())}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Client & Site Details Section */}
            <div className="grid grid-cols-2 gap-6 my-6 bg-slate-50/80 p-4 rounded-lg border border-slate-200/80 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#082B52] mb-1">
                  Client Details:
                </p>
                <p className="font-bold text-slate-900 text-sm">{client?.name || 'Valued Client'}</p>
                {client?.companyName && (
                  <p className="font-semibold text-slate-700">{client.companyName}</p>
                )}
                <p className="text-slate-600 mt-1">Phone: {client?.phone || '-'}</p>
                <p className="text-slate-600">Email: {client?.email || '-'}</p>
                <p className="text-slate-600">{client?.physicalAddress}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#082B52] mb-1">
                  Project & Site Details:
                </p>
                <p className="font-bold text-slate-900">
                  {project?.title || quote?.title || invoice?.title || 'Contract Construction Works'}
                </p>
                <p className="text-slate-600 mt-1">
                  <span className="font-medium">Site Address:</span>{' '}
                  {project?.siteAddress || quote?.siteAddress || client?.physicalAddress || 'Limpopo / Gauteng'}
                </p>
                {project?.siteForeman && (
                  <p className="text-slate-600">
                    <span className="font-medium">Site Foreman:</span> {project.siteForeman}
                  </p>
                )}
              </div>
            </div>

            {/* DOCUMENT BODY - QUOTATION */}
            {documentType === 'quote' && quote && (
              <div className="space-y-6">
                {quote.scopeOfWork && (
                  <div className="text-xs">
                    <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-1">
                      Scope of Works
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-sm border border-slate-200">
                      {quote.scopeOfWork}
                    </p>
                  </div>
                )}

                {/* BOQ Line Items Table */}
                <div>
                  <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-2">
                    Bill of Quantities (BOQ) Breakdown
                  </h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#082B52] text-white text-[11px]">
                        <th className="p-2.5 font-bold">#</th>
                        <th className="p-2.5 font-bold">Category & Description</th>
                        <th className="p-2.5 font-bold text-center">Unit</th>
                        <th className="p-2.5 font-bold text-right">Qty</th>
                        <th className="p-2.5 font-bold text-right">Rate (ZAR)</th>
                        <th className="p-2.5 font-bold text-right">Total (ZAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                      {(quote.items || []).map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50/60">
                          <td className="p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-2.5">
                            <span className="font-bold text-[#082B52] block text-[11px]">
                              {item.category}
                            </span>
                            <span className="text-slate-700">{item.description}</span>
                          </td>
                          <td className="p-2.5 text-center text-slate-600">{item.unit}</td>
                          <td className="p-2.5 text-right font-medium">{item.quantity}</td>
                          <td className="p-2.5 text-right">{formatZAR(item.unitRate)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {formatZAR(item.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Totals */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>{formatZAR(quote.subtotal)}</span>
                    </div>
                    {quote.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount:</span>
                        <span>-{formatZAR(quote.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>VAT (15%):</span>
                      <span>{formatZAR(quote.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-[#082B52] pt-2 border-t border-slate-300">
                      <span>TOTAL ESTIMATE:</span>
                      <span className="text-base text-[#082B52]">{formatZAR(quote.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Milestone Schedule & Terms */}
                {quote.paymentScheduleTerms && (
                  <div className="text-xs border-t border-slate-200 pt-4">
                    <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-1">
                      Agreed Milestone Drawdown Schedule
                    </h4>
                    <p className="text-slate-700 whitespace-pre-line bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                      {quote.paymentScheduleTerms}
                    </p>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-4 space-y-1">
                  <p className="font-bold text-slate-700 uppercase tracking-wider">
                    Contractual Terms & Specifications:
                  </p>
                  <p className="whitespace-pre-line">{settings.defaultQuoteTerms}</p>
                </div>

                {/* Acceptance Signoff Block */}
                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-[#082B52]">For Vacanyi Building Construction:</p>
                    <div className="h-14 border-b border-slate-300 mt-2 flex flex-col justify-end">
                      {settings.signatureDataUrl ? (
                        <img
                          src={settings.signatureDataUrl}
                          alt="Vacanyi Signature"
                          className="max-h-12 object-contain self-start"
                        />
                      ) : (
                        <span className="font-serif italic text-sm text-[#082B52]">
                          {settings.signatoryName || 'Authorized Signatory'}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] mt-1">
                      {settings.signatoryName || 'Vacanyi Project Lead'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {settings.signatoryTitle || 'Authorized Builder & Contractor'} • Date: {formatDate(quote.issueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-[#082B52]">Client Acceptance Sign-off:</p>
                    <div className="h-14 border-b border-slate-300 mt-2 flex flex-col justify-end">
                      {quote.status === 'accepted' ? (
                        <span className="font-serif italic text-sm text-[#082B52]">
                          {client?.name || 'M. Mashatola'}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] mt-1">
                      {client?.name || 'Client Representative'}
                    </p>
                    <p className="text-[10px] text-slate-500">Signature & Date</p>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT BODY - TAX INVOICE */}
            {documentType === 'invoice' && invoice && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-2">
                    Invoice Items & Progress Claims
                  </h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#082B52] text-white text-[11px]">
                        <th className="p-2.5 font-bold">#</th>
                        <th className="p-2.5 font-bold">Description</th>
                        <th className="p-2.5 font-bold text-center">Unit</th>
                        <th className="p-2.5 font-bold text-right">Qty</th>
                        <th className="p-2.5 font-bold text-right">Rate (ZAR)</th>
                        <th className="p-2.5 font-bold text-right">Amount (ZAR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                      {(invoice.items || []).map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="p-2.5 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-2.5 text-slate-800 font-medium">{item.description}</td>
                          <td className="p-2.5 text-center text-slate-600">{item.unit}</td>
                          <td className="p-2.5 text-right">{item.quantity}</td>
                          <td className="p-2.5 text-right">{formatZAR(item.unitRate)}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">
                            {formatZAR(item.totalAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Totals */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 space-y-1.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span>{formatZAR(invoice.subtotal)}</span>
                    </div>
                    {invoice.retentionAmount > 0 && (
                      <div className="flex justify-between text-rose-700">
                        <span>Retention ({invoice.retentionPercentage}%):</span>
                        <span>-{formatZAR(invoice.retentionAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>VAT (15%):</span>
                      <span>{formatZAR(invoice.vatAmount)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#082B52] pt-1.5 border-t border-slate-200">
                      <span>TOTAL INVOICED:</span>
                      <span>{formatZAR(invoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Amount Paid:</span>
                      <span>{formatZAR(invoice.amountPaid)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-red-700 pt-2 border-t-2 border-red-200 bg-red-50 p-2 rounded-sm">
                      <span>BALANCE DUE:</span>
                      <span>{formatZAR(invoice.balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Official Banking Transfer Card */}
                <div className="bg-[#082B52]/5 border-2 border-[#082B52]/20 rounded-xl p-4 text-xs">
                  <div className="flex items-center gap-2 text-[#082B52] font-bold mb-2">
                    <CreditCard className="w-4 h-4 text-[#D5A11E]" />
                    <span>EFT BANKING TRANSFER DETAILS</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-700 text-[11px]">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Bank:</p>
                      <p className="font-bold">{settings.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Account Name:</p>
                      <p className="font-bold">{settings.accountName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Account Number:</p>
                      <p className="font-bold font-mono text-sm text-[#082B52]">{settings.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Branch Code:</p>
                      <p className="font-bold font-mono">{settings.branchCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Account Type:</p>
                      <p className="font-bold">{settings.accountType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Payment Reference:</p>
                      <p className="font-bold text-red-700 font-mono bg-red-100 px-1 py-0.5 rounded-sm inline-block">
                        {invoice.paymentReference || invoice.invoiceNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-4">
                  <p className="font-bold text-slate-700">Payment Terms:</p>
                  <p>{settings.defaultInvoiceTerms}</p>
                </div>

                {/* Invoice Signoff Block */}
                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs">
                  <div>
                    <p className="font-bold text-[#082B52]">Issued & Certified by Vacanyi Building:</p>
                    <div className="h-12 border-b border-slate-300 mt-1 flex flex-col justify-end">
                      {settings.signatureDataUrl ? (
                        <img
                          src={settings.signatureDataUrl}
                          alt="Vacanyi Signature"
                          className="max-h-11 object-contain self-start"
                        />
                      ) : (
                        <span className="font-serif italic text-sm text-[#082B52]">
                          {settings.signatoryName || 'Authorized Signatory'}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] mt-1">
                      {settings.signatoryName || 'Vacanyi Project Lead'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {settings.signatoryTitle || 'Authorized Builder & Contractor'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#082B52] bg-slate-100 border border-slate-200 px-3 py-1 rounded">
                      Official Tax Invoice
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT BODY - MILESTONE PAYMENT RECEIPT */}
            {documentType === 'receipt' && receipt && (
              <div className="space-y-6">
                {/* Paid Verification Stamp Banner */}
                <div className="border-2 border-emerald-500 bg-emerald-50/70 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h4 className="font-black text-emerald-900 text-sm tracking-wide">
                        PAYMENT RECEIVED & CONFIRMED
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Official payment acknowledgement receipt issued by Vacanyi Building Construction.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-800">
                      {formatZAR(receipt.amountPaid)}
                    </span>
                  </div>
                </div>

                {/* Receipt Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Milestone Stage Credited:</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{receipt.milestoneDescription}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Payment Method:</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{receipt.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Bank Transaction Reference:</p>
                    <p className="font-mono font-bold text-[#082B52] mt-0.5">{receipt.bankReference || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Remaining Contract Balance:</p>
                    <p className="font-bold text-slate-900 text-sm mt-0.5">{formatZAR(receipt.remainingProjectBalance)}</p>
                  </div>
                </div>

                {receipt.notes && (
                  <div className="text-xs bg-white p-3 rounded-lg border border-slate-200">
                    <p className="font-bold text-[#082B52] mb-1">Receipt Notes:</p>
                    <p className="text-slate-700">{receipt.notes}</p>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs">
                  <div>
                    <p className="text-slate-500">Processed & Certified by:</p>
                    <div className="h-11 border-b border-slate-300 mt-1 flex flex-col justify-end">
                      {settings.signatureDataUrl ? (
                        <img
                          src={settings.signatureDataUrl}
                          alt="Vacanyi Signature"
                          className="max-h-10 object-contain self-start"
                        />
                      ) : (
                        <span className="font-serif italic text-sm text-[#082B52]">
                          {settings.signatoryName || receipt.receivedBy}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] mt-1">{settings.signatoryName || receipt.receivedBy}</p>
                    <p className="text-[10px] text-slate-400">Vacanyi Financial Accounts System</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 bg-emerald-700 text-white rounded-md text-[10px] font-bold tracking-widest uppercase">
                      ✓ Official Stamped Receipt
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT BODY - CLIENT STATEMENT */}
            {documentType === 'statement' && statementData && (
              <div className="space-y-6">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Total Invoiced</p>
                    <p className="text-base font-bold text-[#082B52] mt-1">{formatZAR(statementData.totalInvoiced)}</p>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <p className="text-[10px] text-emerald-700 uppercase font-bold">Total Payments Received</p>
                    <p className="text-base font-bold text-emerald-800 mt-1">{formatZAR(statementData.totalPaid)}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <p className="text-[10px] text-red-700 uppercase font-bold">Outstanding Balance</p>
                    <p className="text-base font-bold text-red-700 mt-1">{formatZAR(statementData.balanceDue)}</p>
                  </div>
                </div>

                {/* Invoices Ledger */}
                <div>
                  <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-2">
                    Invoices & Progress Draws
                  </h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#082B52] text-white text-[11px]">
                        <th className="p-2 font-bold">Date</th>
                        <th className="p-2 font-bold">Invoice #</th>
                        <th className="p-2 font-bold">Description</th>
                        <th className="p-2 font-bold text-right">Invoiced</th>
                        <th className="p-2 font-bold text-right">Paid</th>
                        <th className="p-2 font-bold text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                      {statementData.invoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="p-2 text-slate-600">{formatDate(inv.issueDate)}</td>
                          <td className="p-2 font-bold text-[#082B52]">{inv.invoiceNumber}</td>
                          <td className="p-2 text-slate-700">{inv.title}</td>
                          <td className="p-2 text-right">{formatZAR(inv.totalAmount)}</td>
                          <td className="p-2 text-right text-emerald-700">{formatZAR(inv.amountPaid)}</td>
                          <td className="p-2 text-right font-bold text-slate-900">{formatZAR(inv.balanceDue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Receipts Ledger */}
                <div>
                  <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-2">
                    Payment Receipts Log
                  </h4>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white text-[11px]">
                        <th className="p-2 font-bold">Date</th>
                        <th className="p-2 font-bold">Receipt #</th>
                        <th className="p-2 font-bold">Method</th>
                        <th className="p-2 font-bold">Reference</th>
                        <th className="p-2 font-bold text-right">Amount Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                      {statementData.receipts.map((rec) => (
                        <tr key={rec.id}>
                          <td className="p-2 text-slate-600">{formatDate(rec.paymentDate)}</td>
                          <td className="p-2 font-bold text-[#082B52]">{rec.receiptNumber}</td>
                          <td className="p-2 text-slate-700">{rec.paymentMethod}</td>
                          <td className="p-2 font-mono text-slate-600">{rec.bankReference || '-'}</td>
                          <td className="p-2 text-right font-bold text-emerald-700">{formatZAR(rec.amountPaid)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DOCUMENT BODY - PROJECT MILESTONE REPORT */}
            {documentType === 'project_report' && project && (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Contract Value</p>
                    <p className="text-base font-bold text-[#082B52] mt-0.5">{formatZAR(project.contractValue)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Overall Progress</p>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">{project.progressPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Target Completion</p>
                    <p className="text-base font-bold text-slate-800 mt-0.5">{formatDate(project.estimatedCompletionDate)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#082B52] uppercase tracking-wider text-[11px] mb-2">
                    Construction Milestone Schedule & Sign-Offs
                  </h4>
                  <div className="space-y-3">
                    {(project.milestones || []).map((m, idx) => (
                      <div
                        key={m.id || idx}
                        className={`p-3.5 rounded-lg border text-xs ${
                          m.status === 'certified' || m.status === 'completed'
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : m.status === 'in_progress'
                            ? 'bg-amber-50/60 border-amber-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#082B52] text-white flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{m.title}</span>
                          </div>
                          <span className="font-bold text-slate-800">{formatZAR(m.amount)} ({m.percentageOfContract}%)</span>
                        </div>
                        {m.description && <p className="text-slate-600 mt-1 pl-7">{m.description}</p>}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-current/10 pl-7 text-[11px]">
                          <span className="text-slate-500">Target: {formatDate(m.targetDate)}</span>
                          {m.certifiedBy && (
                            <span className="text-emerald-700 font-semibold">
                              ✓ Certified by {m.certifiedBy} on {formatDate(m.completedDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Milestone Certification Sign-Off Block */}
                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-xs">
                  <div>
                    <p className="font-bold text-[#082B52]">Site Certification & Handover Verification:</p>
                    <div className="h-12 border-b border-slate-300 mt-1 flex flex-col justify-end">
                      {settings.signatureDataUrl ? (
                        <img
                          src={settings.signatureDataUrl}
                          alt="Vacanyi Signature"
                          className="max-h-11 object-contain self-start"
                        />
                      ) : (
                        <span className="font-serif italic text-sm text-[#082B52]">
                          {settings.signatoryName || 'Authorized Signatory'}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-[11px] mt-1">
                      {settings.signatoryName || 'Vacanyi Project Lead'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {settings.signatoryTitle || 'Authorized Builder & Contractor'} • NHBRC Reg: {settings.nhbrcNumber}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded">
                      ✓ Certified Progress Report
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-12 pt-6 border-t-2 border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
              <div>
                <p className="font-bold text-[#082B52]">{settings.companyName}</p>
                <p>Excellence in South African Construction & Structural Engineering</p>
              </div>
              <div className="text-right">
                <p>Generated via Vacanyi Portal • portal.vacanyi.co.za</p>
                <p>Page 1 of 1</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
