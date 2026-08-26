'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  FileSpreadsheet,
  ReceiptText,
  FileCheck2,
  Users,
  HardHat,
  Share2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { DataStore } from '@/lib/storage/data-store';

export function Topbar() {
  const router = useRouter();
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/clients?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-80 max-w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search clients, projects, invoices..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#082B52]/20 focus:border-[#082B52] transition-all"
        />
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#082B52] hover:bg-[#103D70] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D5A11E]" />
            <span>Quick Create</span>
          </button>

          {isQuickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsQuickMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  AI Importer & Actions
                </div>
                <Link
                  href="/scan"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-[#082B52] bg-[#D5A11E]/10 hover:bg-[#D5A11E]/20 font-bold rounded-lg mx-1 mb-1 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#D5A11E]" />
                  <span>Scan Document (AI)</span>
                </Link>
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Create Document
                </div>
                <Link
                  href="/quotes/new"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#082B52] font-semibold"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>New BOQ Quotation</span>
                </Link>
                <Link
                  href="/invoices/new"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#082B52] font-semibold"
                >
                  <ReceiptText className="w-4 h-4 text-emerald-600" />
                  <span>New Tax Invoice</span>
                </Link>
                <Link
                  href="/receipts/new"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#082B52] font-semibold"
                >
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  <span>Issue Milestone Receipt</span>
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <Link
                  href="/projects?new=true"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#082B52] font-semibold"
                >
                  <HardHat className="w-4 h-4 text-purple-600" />
                  <span>New Site Project</span>
                </Link>
                <Link
                  href="/clients?new=true"
                  onClick={() => setIsQuickMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#082B52] font-semibold"
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Add New Client</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* 1-Tap WhatsApp Web Direct shortcut */}
        <a
          href="https://web.whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Open WhatsApp Web"
          className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <Share2 className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </header>
  );
}
