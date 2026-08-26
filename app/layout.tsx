import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWARegister } from '@/components/pwa/pwa-register';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://portal.vacanyi.co.za'),
  title: {
    default: 'Vacanyi Building | Contractor Management & Project Portal',
    template: '%s | Vacanyi Portal',
  },
  description:
    'Vacanyi Building Construction & Project Management Portal. Precision CRM, Site Projects, BOQ Quotes, Tax Invoices, Milestone Receipts, AI Document Scanner, and 1-Tap Client WhatsApp Sharing.',
  applicationName: 'Vacanyi Portal',
  manifest: '/manifest.json',
  openGraph: {
    title: 'Vacanyi Building | Contractor Management & Project Portal',
    description:
      'Precision Building Construction & Project Management. Official BOQ Quotations, Tax Invoices, Milestone Receipts, and Client Site Accounts.',
    url: 'https://portal.vacanyi.co.za',
    siteName: 'Vacanyi Building Construction & Project',
    locale: 'en_ZA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vacanyi Building | Contractor Management & Project Portal',
    description:
      'Precision Building Construction & Project Management. Official BOQ Quotations, Tax Invoices, Milestone Receipts, and Client Site Accounts.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vacanyi Portal',
  },
  formatDetection: {
    telephone: true,
  },
  icons: {
    icon: [
      { url: '/brand/favicon.ico' },
      { url: '/brand/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/brand/vacanyi-icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#082B52',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZA">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#082B52" />
        <link rel="apple-touch-icon" href="/brand/vacanyi-icon-180.png" />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#D5A11E]/30 selection:text-[#082B52]">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
