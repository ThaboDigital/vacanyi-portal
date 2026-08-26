'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  FileSpreadsheet,
  ReceiptText,
  FileCheck2,
  HardHat,
  Users,
  Share2,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileActionSheet({ isOpen, onClose }: MobileActionSheetProps) {
  if (!isOpen) return null;

  const actions = [
    {
      href: '/quotes/new',
      title: 'New BOQ Quotation',
      subtitle: 'Build Bill of Quantities & estimate',
      icon: FileSpreadsheet,
      color: 'bg-blue-600 text-white',
      badge: 'Estimate',
    },
    {
      href: '/invoices/new',
      title: 'New Tax Invoice',
      subtitle: 'Issue progress drawdown claim',
      icon: ReceiptText,
      color: 'bg-emerald-600 text-white',
      badge: 'Billing',
    },
    {
      href: '/receipts/new',
      title: 'Issue Milestone Receipt',
      subtitle: 'Acknowledge client EFT payment',
      icon: FileCheck2,
      color: 'bg-amber-600 text-white',
      badge: 'Receipt',
    },
    {
      href: '/projects?new=true',
      title: 'New Site Project',
      subtitle: 'Register active construction site',
      icon: HardHat,
      color: 'bg-purple-600 text-white',
      badge: 'Project',
    },
    {
      href: '/clients?new=true',
      title: 'Add New Client',
      subtitle: 'Create client CRM profile',
      icon: Users,
      color: 'bg-[#082B52] text-[#D5A11E]',
      badge: 'CRM',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-up Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 pb-[max(env(safe-area-inset-bottom),20px)]">
        {/* Grab Handle */}
        <div className="flex justify-center pt-3 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full cursor-pointer" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-[#082B52] tracking-tight">Contractor Actions</h3>
            <p className="text-xs text-slate-500">Quick create documents and site workflows</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-4 space-y-2.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                onClick={onClose}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 active:bg-slate-200/80 border border-slate-200/80 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-xs ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{action.title}</h4>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded">
                        {action.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{action.subtitle}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
