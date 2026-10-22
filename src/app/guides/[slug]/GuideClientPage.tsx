'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GuideSchema } from '@/types/guide';
import { GuideViewer } from '@/components/GuideViewer';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface GuideClientPageProps {
  initialGuide: GuideSchema | null;
  slug: string;
}

export function GuideClientPage({ initialGuide, slug }: GuideClientPageProps) {
  const router = useRouter();

  if (!initialGuide) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div
          className="glass-panel"
          style={{
            maxWidth: '560px',
            margin: '0 auto',
            padding: '3rem 2rem',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <AlertCircle size={24} color="#dc2626" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Guide Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '2rem' }}>
            We could not find an OAuth setup guide matching &quot;{slug}&quot;. It may have been relocated or you can research it live.
          </p>
          <Link href="/" className="btn btn-primary" id="return-home-btn">
            <ArrowLeft size={16} />
            <span>Return to Guide Directory</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '1.5rem' }}>
      <GuideViewer
        guide={initialGuide}
        onBack={() => router.push('/')}
        shareableUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </div>
  );
}
