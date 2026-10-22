import type { Metadata } from 'next';
import '@/styles/globals.css';
import Link from 'next/link';
import { ShieldCheck, Sparkles, BookOpen, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'OAuth Setup Guide Agent | Actionable & Verified Integration Guides',
  description:
    'Searchable library and AI-powered research agent for third-party OAuth 2.0 app configuration, permission scopes, verification requirements, and step-by-step setup guides.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand-logo" id="header-brand-logo">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.4rem',
                  height: '2.4rem',
                  borderRadius: '10px',
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                }}
              >
                <ShieldCheck size={20} color="#ffffff" />
              </div>
              <div>
                <span>OAuth Guide Agent</span>
              </div>
              <span className="brand-badge">Gemini Powered</span>
            </Link>

            <nav className="nav-links">
              <Link href="/" className="nav-link" id="nav-link-library">
                <BookOpen size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
                Guide Library
              </Link>
              <Link href="/#live-research" className="btn btn-primary btn-sm" id="nav-btn-research">
                <Sparkles size={14} />
                Research New App
              </Link>
            </nav>
          </div>
        </header>

        <main className="main-content">{children}</main>

        <footer className="site-footer">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>OAuth Setup Guide Agent</strong> — Evidence-first integration research for developers & AI builders.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Strict evidence attribution: Documented, Configuration Checked, Tested, Estimated, and Blocked.
              </p>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Core Intelligence: Google Gemini LLM • Next.js App Router
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
