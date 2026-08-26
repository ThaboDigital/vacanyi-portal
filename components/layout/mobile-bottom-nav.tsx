'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  HardHat,
  Plus,
  ReceiptText,
  Users,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenActionSheet: () => void;
}

export function MobileBottomNav({ onOpenActionSheet }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/' || pathname === '/dashboard';
  const isProjects = pathname.startsWith('/projects');
  const isInvoices = pathname.startsWith('/invoices') || pathname.startsWith('/quotes') || pathname.startsWith('/receipts');
  const isClients = pathname.startsWith('/clients');

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[#082B52]/95 backdrop-blur-lg border-t border-white/10 text-white shadow-2xl pb-[max(env(safe-area-inset-bottom),10px)] select-none">
      <div className="flex items-center justify-around px-2 py-1.5 relative">
        {/* 1. Dashboard Tab */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isHome ? 'text-[#D5A11E] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Overview</span>
          {isHome && <span className="w-1 h-1 rounded-full bg-[#D5A11E] mt-0.5" />}
        </Link>

        {/* 2. Projects Tab */}
        <Link
          href="/projects"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isProjects ? 'text-[#D5A11E] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <HardHat className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Sites</span>
          {isProjects && <span className="w-1 h-1 rounded-full bg-[#D5A11E] mt-0.5" />}
        </Link>

        {/* 3. CENTER ELEVATED (+) ACTION BUTTON */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={onOpenActionSheet}
            aria-label="Create New Document or Project"
            className="w-13 h-13 rounded-full bg-[#D5A11E] hover:bg-[#B38615] active:bg-[#EDC34E] text-[#082B52] flex items-center justify-center shadow-xl ring-4 ring-slate-50 transition-transform active:scale-90"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-black uppercase text-amber-300 tracking-wider mt-1">
            Action
          </span>
        </div>

        {/* 4. Invoices / Billing Tab */}
        <Link
          href="/invoices"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isInvoices ? 'text-[#D5A11E] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <ReceiptText className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Billing</span>
          {isInvoices && <span className="w-1 h-1 rounded-full bg-[#D5A11E] mt-0.5" />}
        </Link>

        {/* 5. Clients / CRM Tab */}
        <Link
          href="/clients"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
            isClients ? 'text-[#D5A11E] font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Clients</span>
          {isClients && <span className="w-1 h-1 rounded-full bg-[#D5A11E] mt-0.5" />}
        </Link>
      </div>
    </nav>
  );
}
