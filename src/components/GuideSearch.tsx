import React, { useState, useMemo } from 'react';
import { GuideSchema } from '@/types/guide';
import { Search, Clock, ShieldCheck, ArrowRight, Filter, Zap, ShieldAlert, Sparkles } from 'lucide-react';
import { EvidenceBadge } from '@/components/EvidenceBadge';

interface GuideSearchProps {
  guides: GuideSchema[];
  onSelectGuide: (guide: GuideSchema) => void;
  onInitiateLiveResearch?: (query: string) => void;
}

type FilterCategory = 'all' | 'instant' | 'requires_review' | 'managed_oauth';

export const GuideSearch: React.FC<GuideSearchProps> = ({
  guides,
  onSelectGuide,
  onInitiateLiveResearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      // Filter category check
      if (selectedFilter === 'instant') {
        const isInstant =
          guide.readiness.externalWaitingTime.toLowerCase().includes('0 days') ||
          guide.readiness.externalWaitingTime.toLowerCase().includes('instant');
        if (!isInstant) return false;
      } else if (selectedFilter === 'requires_review') {
        const needsReview =
          guide.readiness.externalWaitingTime.toLowerCase().includes('business days') ||
          guide.readiness.externalWaitingTime.toLowerCase().includes('weeks') ||
          guide.verification.verificationTriggers.length > 0;
        if (!needsReview) return false;
      } else if (selectedFilter === 'managed_oauth') {
        if (!guide.provider.managedOAuthAvailable) return false;
      }

      // Text query check
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        guide.provider.name.toLowerCase().includes(q) ||
        guide.provider.category?.toLowerCase().includes(q) ||
        guide.provider.authMethod.toLowerCase().includes(q) ||
        guide.readiness.difficulty.toLowerCase().includes(q) ||
        guide.readiness.launchBlockers.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [guides, searchQuery, selectedFilter]);

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' };
      case 'Moderate':
        return { color: '#4338ca', bg: '#eef2ff', border: '#c7d2fe' };
      case 'Complex':
      case 'Advanced':
        return { color: '#b45309', bg: '#fffbeb', border: '#fde68a' };
      default:
        return { color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="search-box-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search provider by name, scope, category (e.g. Gmail, Slack, GitHub, Notion)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="guide-search-input"
          />
        </div>

        {/* Filter Chips */}
        <div className="filter-chip-group">
          <button
            className={`filter-chip ${selectedFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('all')}
            id="filter-all"
          >
            All Guides ({guides.length})
          </button>
          <button
            className={`filter-chip ${selectedFilter === 'instant' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('instant')}
            id="filter-instant"
          >
            <Zap size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
            Instant Launch (0-Day Review)
          </button>
          <button
            className={`filter-chip ${selectedFilter === 'requires_review' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('requires_review')}
            id="filter-review"
          >
            <ShieldAlert size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
            Requires Verification Review
          </button>
          <button
            className={`filter-chip ${selectedFilter === 'managed_oauth' ? 'active' : ''}`}
            onClick={() => setSelectedFilter('managed_oauth')}
            id="filter-managed"
          >
            <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
            Managed OAuth Available
          </button>
        </div>
      </div>

      {/* Grid of Guide Cards */}
      {filteredGuides.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="card glass-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => onSelectGuide(guide)}
              id={`guide-card-${guide.id}`}
            >
              <div>
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--accent-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {guide.provider.category || 'Third-Party Integration'}
                    </span>
                    <h3 style={{ fontSize: '1.25rem', marginTop: '0.2rem' }}>{guide.provider.name}</h3>
                  </div>

                  {(() => {
                    const badge = getDifficultyBadge(guide.readiness.difficulty);
                    return (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          color: badge.color,
                        }}
                      >
                        {guide.readiness.difficulty}
                      </span>
                    );
                  })()}
                </div>

                {/* Auth Method */}
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {guide.provider.authMethod}
                </p>

                {/* Key Metrics */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                    padding: '0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '1rem',
                    fontSize: '0.82rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Clock size={14} color="var(--accent-primary)" />
                    <span>
                      <strong>Hands-on:</strong> {guide.readiness.handsOnEffort.split(' ')[0]}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <ShieldCheck size={14} color="var(--status-tested-text)" />
                    <span>
                      <strong>Wait Time:</strong> {guide.readiness.externalWaitingTime.split('(')[0].trim()}
                    </span>
                  </div>
                </div>

                {/* Launch Blockers preview */}
                {guide.readiness.launchBlockers.length > 0 && (
                  <div style={{ marginBottom: '1rem', padding: '0.45rem 0.65rem', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ fontSize: '0.78rem', color: '#b91c1c', display: 'flex', alignItems: 'flex-start', gap: '0.4rem', lineHeight: '1.4', margin: 0 }}>
                      <span style={{ fontWeight: 700 }}>•</span>
                      <span>{guide.readiness.launchBlockers[0]}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '0.85rem',
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <EvidenceBadge status={guide.steps[0]?.evidenceStatus || 'Documented'} size="sm" />
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <span>View Guide</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State with Live Research Hook */
        <div
          className="glass-panel"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '2rem auto',
          }}
        >
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: 'var(--accent-gradient-subtle)',
              border: '1px solid #c7d2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Sparkles size={24} color="var(--accent-primary)" />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>No predefined guide found for &quot;{searchQuery}&quot;</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            The OAuth Setup Guide Agent can autonomously research this provider, inspect official documentation, run validation checks, and generate an actionable guide in real time.
          </p>
          {onInitiateLiveResearch && (
            <button
              className="btn btn-primary"
              onClick={() => onInitiateLiveResearch(searchQuery)}
              id="empty-state-research-btn"
            >
              <Sparkles size={16} />
              <span>Research &quot;{searchQuery}&quot; with Google Gemini</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
