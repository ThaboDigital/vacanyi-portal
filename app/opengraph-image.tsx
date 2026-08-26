import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Vacanyi Building Construction & Project Portal';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#082B52',
          backgroundImage:
            'radial-gradient(circle at 90% 10%, rgba(213, 161, 30, 0.25) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(16, 61, 112, 0.6) 0%, transparent 60%)',
          padding: '60px 70px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Top Header: Brand Badge & NHBRC Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '12px 24px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              border: '2px solid rgba(213, 161, 30, 0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: '#082B52',
                  letterSpacing: '1px',
                }}
              >
                VACANYI BUILDING
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: '#D5A11E',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                }}
              >
                CONSTRUCTION & PROJECT
              </span>
            </div>
          </div>

          {/* NHBRC / Verified Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '16px',
              padding: '10px 20px',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '6px',
                backgroundColor: '#10B981',
              }}
            />
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#F1D681',
                letterSpacing: '0.5px',
              }}
            >
              Official Contractor Portal
            </span>
          </div>
        </div>

        {/* Middle Hero: Value Proposition */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: '#D5A11E',
                backgroundColor: 'rgba(213, 161, 30, 0.15)',
                padding: '6px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(213, 161, 30, 0.3)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Turnkey Construction & Project Accounts
            </span>
          </div>

          <h1
            style={{
              fontSize: 52,
              fontWeight: 900,
              lineHeight: 1.15,
              color: 'white',
              margin: 0,
              letterSpacing: '-1px',
            }}
          >
            Precision Building, BOQ Estimates & Milestone Invoicing
          </h1>

          <p
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: '#CBD5E1',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Live Site Projects, Branded Tax Invoices, Materials Schedules & 1-Tap Client WhatsApp Sharing.
          </p>
        </div>

        {/* Bottom Feature Grid & Location Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          {/* Feature Badges */}
          <div
            style={{
              display: 'flex',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 18, color: '#D5A11E' }}>✓</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>BOQ Quotations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 18, color: '#D5A11E' }}>✓</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>Tax Invoices & Receipts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 18, color: '#D5A11E' }}>✓</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>AI Doc Scanner</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: 18, color: '#D5A11E' }}>✓</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0' }}>1-Tap WhatsApp</span>
            </div>
          </div>

          {/* Location & Website URL */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#F1D681',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                padding: '8px 18px',
                borderRadius: '12px',
                border: '1px solid rgba(213, 161, 30, 0.4)',
              }}
            >
              portal.vacanyi.co.za
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
