'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  HardHat,
  FileSpreadsheet,
  ReceiptText,
  FileCheck2,
  BarChart3,
  Settings,
  ExternalLink,
  ShieldCheck,
  Phone,
  Scan,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/scan', label: 'AI Doc Scanner', icon: Scan, badge: 'AI' },
  { href: '/clients', label: 'Clients & CRM', icon: Users },
  { href: '/projects', label: 'Site Projects', icon: HardHat },
  { href: '/quotes', label: 'BOQ Quotations', icon: FileSpreadsheet },
  { href: '/invoices', label: 'Tax Invoices', icon: ReceiptText },
  { href: '/receipts', label: 'Milestone Receipts', icon: FileCheck2 },
  { href: '/reports', label: 'Financial Reports', icon: BarChart3 },
  { href: '/settings', label: 'Company & Banking', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#082B52] text-white min-h-screen flex flex-col justify-between border-r border-[#061E39] select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-sm ring-2 ring-[#D5A11E]/50 shrink-0">
              <Image
                src="/brand/vacanyi-icon-180.png"
                alt="Vacanyi Building"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5 leading-tight">
                VACANYI <span className="text-[#D5A11E] font-extrabold text-xs">PORTAL</span>
              </h1>
              <p className="text-[10px] text-slate-300 tracking-wider uppercase font-medium mt-0.5">
                Contractor Management
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Workflows
          </div>
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-[#D5A11E] text-[#082B52] shadow-sm font-bold'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#082B52]' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-white/20">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Status */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Compliance info */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F1D681]">
            <ShieldCheck className="w-4 h-4 text-[#D5A11E]" />
            <span>NHBRC & SANS 10400</span>
          </div>
          <p className="text-[10px] text-slate-300 mt-1">
            Registered Home Builder Reg: 300029817
          </p>
        </div>

        {/* Phone support */}
        <a
          href="tel:+27633437927"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-slate-200 font-medium transition-colors"
        >
          <Phone className="w-3.5 h-3.5 text-[#D5A11E]" />
          <span>063 343 7927</span>
        </a>

        {/* Main Website Link */}
        <a
          href="https://vacanyi.co.za"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between text-[11px] text-slate-400 hover:text-white transition-colors px-1"
        >
          <span>vacanyi.co.za</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
}
