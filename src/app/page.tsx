'use client';

import React, { useState, useEffect } from 'react';
import { seedGuides } from '@/data/seedGuides';
import { GuideSchema } from '@/types/guide';
import { GuideSearch } from '@/components/GuideSearch';
import { GuideViewer } from '@/components/GuideViewer';
import { LiveResearchConsole } from '@/components/LiveResearchConsole';
import { Sparkles, ShieldCheck, Zap, BookOpen, Layers } from 'lucide-react';

export default function HomePage() {
  const [guides, setGuides] = useState<GuideSchema[]>(seedGuides);
  const [selectedGuide, setSelectedGuide] = useState<GuideSchema | null>(null);
  const [liveQuery, setLiveQuery] = useState('');

  // Fetch all guides (seed + dynamically generated)
  useEffect(() => {
    fetch('/api/guides')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.guides && data.guides.length > 0) {
          setGuides(data.guides);

          // Check if URL has a ?guide=slug
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const slug = params.get('guide');
            if (slug) {
              const found = data.guides.find((g: GuideSchema) => g.slug === slug || g.id === slug);
              if (found) {
                setSelectedGuide(found);
              }
            }
          }
        }
      })
      .catch((err) => console.warn('Could not load dynamic guides:', err));
  }, []);

  const handleSelectGuide = (guide: GuideSchema) => {
    setSelectedGuide(guide);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `?guide=${guide.slug}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToDirectory = () => {
    setSelectedGuide(null);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleInitiateLiveResearch = (query: string) => {
    setLiveQuery(query);
    const researchEl = document.getElementById('live-research');
    if (researchEl) {
      researchEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGuideGenerated = (newGuide: GuideSchema) => {
    // Add to local guides list if not present
    setGuides((prev) => {
      if (prev.some((g) => g.id === newGuide.id || g.slug === newGuide.slug)) {
        return prev;
      }
      return [newGuide, ...prev];
    });

    // Immediately open the newly generated guide in the GuideViewer
    handleSelectGuide(newGuide);
  };

  return (
    <div className="container">
      {selectedGuide ? (
        <div style={{ paddingTop: '1rem' }}>
          <GuideViewer
            guide={selectedGuide}
            onBack={handleBackToDirectory}
            shareableUrl={
              typeof window !== 'undefined'
                ? `${window.location.origin}/guides/${selectedGuide.slug}`
                : undefined
            }
          />
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section style={{ textAlign: 'center', padding: '3.5rem 0 2rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-gradient-subtle)',
                border: '1px solid #c7d2fe',
                marginBottom: '1.25rem',
              }}
            >
              <Sparkles size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Evidence-First OAuth Integration Intelligence
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.75rem',
                marginBottom: '1rem',
                color: 'var(--text-primary)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              OAuth Setup Guide Agent
            </h1>

            <p style={{ maxWidth: '680px', margin: '0 auto 2.5rem', fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
              Navigate provider developer consoles, permission scopes, consent configurations, and external verification requirements with verified evidence and predictable timelines.
            </p>

            {/* Architecture Highlights Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                maxWidth: '960px',
                margin: '0 auto 3rem',
                textAlign: 'left',
              }}
            >
              <div style={{ padding: '1.1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <BookOpen size={16} />
                  <span>Curated Benchmark Library</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Pre-verified benchmark setup guides covering low, medium, and high-friction providers.
                </p>
              </div>

              <div style={{ padding: '1.1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: 'var(--status-tested-text)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <ShieldCheck size={16} />
                  <span>Evidence Attribution</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Explicit verification tags: Documented, Config Checked, Tested, Estimated, and Blocked.
                </p>
              </div>

              <div style={{ padding: '1.1rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <Layers size={16} />
                  <span>Standard 6-Section Schema</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Sections A through F ensure uniform structure, troubleshooting runbooks, and clear handoffs.
                </p>
              </div>
            </div>
          </section>

          {/* Library Section */}
          <section style={{ marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem' }}>Searchable Guide Library</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Select a provider below to open the complete 6-section setup guide.
                </p>
              </div>
            </div>

            <GuideSearch
              guides={guides}
              onSelectGuide={handleSelectGuide}
              onInitiateLiveResearch={handleInitiateLiveResearch}
            />
          </section>

          {/* Phase 4: Live Agent Research Console */}
          <section id="live-research" style={{ scrollMarginTop: '6rem', marginBottom: '3rem' }}>
            <LiveResearchConsole
              onGuideGenerated={handleGuideGenerated}
              initialQuery={liveQuery}
            />
          </section>
        </>
      )}
    </div>
  );
}
