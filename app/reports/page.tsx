'use client';

import React, { useState, useEffect } from 'react';
import { PortalShell } from '@/components/layout/portal-shell';
import { DataStore } from '@/lib/storage/data-store';
import { Invoice, MilestoneReceipt, Quote, Project, Client } from '@/lib/types';
import { StatCard } from '@/components/ui/stat-card';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Building,
  TrendingUp,
  FileText,
  Clock,
} from 'lucide-react';
import { formatZAR, formatDate } from '@/lib/utils/formatters';
import { PDFGeneratorService } from '@/lib/pdf/pdf-generator';

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<MilestoneReceipt[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState(DataStore.getSettings());
  const [isExporting, setIsExporting] = useState(false);

  const refreshData = () => {
    setInvoices(DataStore.getInvoices());
    setReceipts(DataStore.getReceipts());
    setQuotes(DataStore.getQuotes());
    setProjects(DataStore.getProjects());
    setClients(DataStore.getClients());
    setSettings(DataStore.getSettings());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vacanyi-data-changed', refreshData);
    return () => window.removeEventListener('vacanyi-data-changed', refreshData);
  }, []);

  const totalRevenue = receipts.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.totalAmount || 0), 0);
  const totalReceivables = invoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);
  const totalVatOutput = invoices.reduce((sum, i) => sum + Number(i.vatAmount || 0), 0);

  // Aged Debtors calculation
  const now = new Date();
  const currentDebtors = invoices.filter((i) => i.balanceDue > 0 && new Date(i.dueDate) >= now);
  const overdue30 = invoices.filter((i) => {
    if (i.balanceDue <= 0) return false;
    const diffDays = Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / 86400000);
    return diffDays > 0 && diffDays <= 30;
  });
  const overdue60 = invoices.filter((i) => {
    if (i.balanceDue <= 0) return false;
    const diffDays = Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / 86400000);
    return diffDays > 30 && diffDays <= 60;
  });
  const overdue90 = invoices.filter((i) => {
    if (i.balanceDue <= 0) return false;
    const diffDays = Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / 86400000);
    return diffDays > 60;
  });

  const sumBalances = (list: Invoice[]) => list.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);

  const handleExportPDF = async () => {
    setIsExporting(true);
    await PDFGeneratorService.exportElementToPDF('vacanyi-financial-report-sheet', `Vacanyi_Financial_Report_${new Date().getFullYear()}.pdf`);
    setIsExporting(false);
  };

  const handleExportCSV = () => {
    const rows = [
      ['Invoice Number', 'Client', 'Date', 'Due Date', 'Total Amount (ZAR)', 'Paid (ZAR)', 'Balance (ZAR)', 'Status'],
      ...invoices.map((inv) => {
        const client = clients.find((c) => c.id === inv.clientId);
        return [
          inv.invoiceNumber,
          client?.name || '',
          inv.issueDate,
          inv.dueDate,
          inv.totalAmount.toString(),
          inv.amountPaid.toString(),
          inv.balanceDue.toString(),
          inv.status,
        ];
      }),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vacanyi_invoices_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PortalShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#082B52] tracking-tight">Financial Reports & Analytics</h2>
            <p className="text-xs text-slate-500 mt-1">
              Executive cashflow overview, aged debtors analysis, and SARS VAT output summary.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#D5A11E]" />
              <span>{isExporting ? 'Exporting...' : 'Export Financial PDF'}</span>
            </button>
          </div>
        </div>

        {/* Printable Report Container */}
        <div id="vacanyi-financial-report-sheet" className="space-y-6">
          {/* Top KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Cash Collected"
              value={formatZAR(totalRevenue)}
              subtitle="All verified receipts"
              icon={Wallet}
              variant="navy"
            />
            <StatCard
              title="Total Invoiced"
              value={formatZAR(totalInvoiced)}
              subtitle={`${invoices.length} invoices issued`}
              icon={Receipt}
              variant="default"
            />
            <StatCard
              title="Total Receivables"
              value={formatZAR(totalReceivables)}
              subtitle="Outstanding claims"
              icon={Clock}
              variant="amber"
            />
            <StatCard
              title="SARS VAT Output (15%)"
              value={formatZAR(totalVatOutput)}
              subtitle={`Tax Reg: ${settings.taxNumber}`}
              icon={Building}
              variant="emerald"
            />
          </div>

          {/* Aged Debtors Analysis Section */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-bold text-lg text-[#082B52]">Aged Debtors & Outstanding Receivables</h3>
                <p className="text-xs text-slate-500">Aging breakdown based on invoice due dates</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Total Outstanding</span>
                <p className="text-base font-black text-red-700">{formatZAR(totalReceivables)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-600">Current (Not Due)</span>
                <p className="text-xl font-bold text-slate-900 mt-1">{formatZAR(sumBalances(currentDebtors))}</p>
                <p className="text-[10px] text-slate-500 mt-1">{currentDebtors.length} invoices</p>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold uppercase text-amber-800">1 - 30 Days Overdue</span>
                <p className="text-xl font-bold text-amber-900 mt-1">{formatZAR(sumBalances(overdue30))}</p>
                <p className="text-[10px] text-amber-700 mt-1">{overdue30.length} invoices</p>
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <span className="text-[10px] font-bold uppercase text-orange-800">31 - 60 Days Overdue</span>
                <p className="text-xl font-bold text-orange-900 mt-1">{formatZAR(sumBalances(overdue60))}</p>
                <p className="text-[10px] text-orange-700 mt-1">{overdue60.length} invoices</p>
              </div>

              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                <span className="text-[10px] font-bold uppercase text-rose-800">60+ Days Overdue</span>
                <p className="text-xl font-black text-rose-900 mt-1">{formatZAR(sumBalances(overdue90))}</p>
                <p className="text-[10px] text-rose-700 mt-1">{overdue90.length} invoices</p>
              </div>
            </div>
          </div>

          {/* Detailed Invoices Ledger Table */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="font-bold text-lg text-[#082B52]">Full Financial Invoices & Collection Ledger</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#082B52] text-white text-[11px]">
                    <th className="p-3 font-bold">Invoice #</th>
                    <th className="p-3 font-bold">Client Name</th>
                    <th className="p-3 font-bold">Issue Date</th>
                    <th className="p-3 font-bold">Due Date</th>
                    <th className="p-3 font-bold text-right">Invoiced (ZAR)</th>
                    <th className="p-3 font-bold text-right">VAT (15%)</th>
                    <th className="p-3 font-bold text-right">Paid (ZAR)</th>
                    <th className="p-3 font-bold text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 border-b border-slate-200">
                  {invoices.map((inv) => {
                    const client = clients.find((c) => c.id === inv.clientId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#082B52]">{inv.invoiceNumber}</td>
                        <td className="p-3 font-semibold text-slate-900">{client?.name || '-'}</td>
                        <td className="p-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                        <td className="p-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatZAR(inv.totalAmount)}</td>
                        <td className="p-3 text-right text-slate-600">{formatZAR(inv.vatAmount)}</td>
                        <td className="p-3 text-right text-emerald-700 font-semibold">{formatZAR(inv.amountPaid)}</td>
                        <td className="p-3 text-right font-bold">
                          <span className={inv.balanceDue > 0 ? 'text-red-700' : 'text-slate-400'}>
                            {formatZAR(inv.balanceDue)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
