'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { MobileBottomNav } from './mobile-bottom-nav';
import { MobileActionSheet } from './mobile-action-sheet';
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import { Menu, X, ExternalLink, Camera } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function PortalShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="lg:hidden h-14 bg-[#082B52] text-white px-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-slate-200 hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1 shadow-xs ring-1 ring-white/30 shrink-0">
              <Image
                src="/brand/vacanyi-icon-180.png"
                alt="Vacanyi Building"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-sm text-white">
              VACANYI <span className="text-[#D5A11E] font-extrabold">PORTAL</span>
            </span>
          </div>

          <Link
            href="/scan"
            className="w-8 h-8 rounded-lg bg-[#D5A11E] hover:bg-[#B38615] text-[#082B52] flex items-center justify-center shadow-xs transition-transform active:scale-90"
            title="Scan Document (AI)"
            aria-label="Scan Document with Camera"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>

        <Topbar />
        
        {/* Main Content Container with bottom padding for mobile sticky nav */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-28 lg:pb-8 flex flex-col justify-between">
          <div className="flex-1">
            {children}
          </div>

          {/* Global Portal Footer */}
          <footer className="mt-12 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 select-none">
            <p>© {new Date().getFullYear()} Vacanyi Building Construction & Project. All rights reserved.</p>
            <p>
              Designed & Developed by{' '}
              <a
                href="https://www.thabosystems.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#082B52] hover:text-[#D5A11E] transition-colors inline-flex items-center gap-1 hover:underline"
              >
                <span>Thabo Systems</span>
                <ExternalLink className="w-3 h-3 text-[#D5A11E]" />
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* Modern Mobile Bottom Sticky Menu */}
      <MobileBottomNav onOpenActionSheet={() => setIsActionSheetOpen(true)} />

      {/* Slide-up Quick Action Drawer */}
      <MobileActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />

      {/* PWA Mobile Installation Prompt Banner */}
      <PWAInstallPrompt />
    </div>
  );
}
