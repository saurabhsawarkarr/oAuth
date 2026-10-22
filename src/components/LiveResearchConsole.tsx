'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GuideSchema, ResearchProgressEvent } from '@/types/guide';
import {
  Sparkles,
  Terminal as TerminalIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Search,
  Globe,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';

interface LiveResearchConsoleProps {
  onGuideGenerated: (guide: GuideSchema) => void;
  initialQuery?: string;
}

const STAGES = [
  { index: 1, key: 'identifying', label: '1. Resolve Identity' },
  { index: 2, key: 'discovering_sources', label: '2. Discover Sources' },
  { index: 3, key: 'extracting_requirements', label: '3. Gemini Extraction' },
  { index: 4, key: 'reconstructing_workflow', label: '4. Workflow Graph' },
  { index: 5, key: 'probing_endpoints', label: '5. Safe Probes' },
  { index: 6, key: 'synthesizing_guide', label: '6. Synthesis & Scrub' },
  { index: 7, key: 'completed', label: '7. Ready & Shared' },
];

const PRESETS = ['Linear', 'Figma', 'Spotify', 'HubSpot', 'Discord', 'Zoom', 'Asana', 'Dropbox'];

export const LiveResearchConsole: React.FC<LiveResearchConsoleProps> = ({
  onGuideGenerated,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isResearching, setIsResearching] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [logs, setLogs] = useState<Array<{ text: string; type: string; timestamp: string }>>([]);
  const [discoveredSources, setDiscoveredSources] = useState<Array<{ title: string; url: string }>>([]);
  const [generatedGuide, setGeneratedGuide] = useState<GuideSchema | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle initial query prop updates
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const addLog = (text: string, type: string = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { text, type, timestamp: time }]);
  };

  const handleStartResearch = async (targetQuery?: string) => {
    const q = (targetQuery || query).trim();
    if (!q) return;

    setIsResearching(true);
    setErrorMessage(null);
    setGeneratedGuide(null);
    setLogs([]);
    setDiscoveredSources([]);
    setCurrentStageIndex(1);

    addLog(`Initiating autonomous OAuth research for "${q}"...`, 'info');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: ResearchProgressEvent = JSON.parse(line.substring(6));

              setCurrentStageIndex(event.stageIndex);

              // Classify log styling
              let logType = 'info';
              if (event.stage === 'extracting_requirements' || event.stage === 'synthesizing_guide') {
                logType = 'gemini';
              } else if (event.stage === 'probing_endpoints') {
                logType = 'probe';
              } else if (event.stage === 'completed') {
                logType = 'success';
              } else if (event.stage === 'error') {
                logType = 'error';
              }

              addLog(`[Stage ${event.stageIndex}/7] ${event.message}`, logType);

              if (event.details) {
                addLog(`  ↳ ${event.details}`, 'info');
              }

              if (event.discoveredSources && event.discoveredSources.length > 0) {
                setDiscoveredSources(event.discoveredSources);
                event.discoveredSources.forEach((s) => {
                  addLog(`  [CITED DOC] ${s.title}: ${s.url}`, 'info');
                });
              }

              if (event.probeResult) {
                addLog(
                  `  [PROBE] ${event.probeResult.test}: ${event.probeResult.observedResult}`,
                  'probe'
                );
              }

              if (event.stage === 'completed' && event.guide) {
                setGeneratedGuide(event.guide);
                addLog(`✓ Research complete! Guide synthesized for ${event.guide.provider.name}.`, 'success');
              }

              if (event.error) {
                setErrorMessage(event.error);
                addLog(`✖ Pipeline error: ${event.error}`, 'error');
              }
            } catch (err) {
              console.warn('Failed to parse SSE line:', line, err);
            }
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      addLog(`Failed to communicate with research engine: ${msg}`, 'error');
    } finally {
      setIsResearching(false);
    }
  };

  const getProgressPercentage = () => {
    if (currentStageIndex === 0) return 0;
    return Math.min(100, Math.round((currentStageIndex / 7) * 100));
  };

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem' }}>
      {/* Title & Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '10px',
            background: 'var(--accent-gradient)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Sparkles size={16} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem' }}>Live Research Agent for Unfamiliar Apps</h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Powered by Google Gemini LLM & Safe Non-Destructive Probers
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '760px', marginBottom: '1.5rem', lineHeight: '1.6' }}>
        Enter any third-party app name or website not in our pre-indexed library. The autonomous research engine will discover authentic developer portals, extract permission scopes, execute read-only RFC 8414 probes, and synthesize a standardized 6-section guide in real time.
      </p>

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="search-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Enter app name or website (e.g. Linear, Figma, Spotify, HubSpot)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isResearching) {
                handleStartResearch();
              }
            }}
            disabled={isResearching}
            id="live-research-query-input"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleStartResearch()}
          disabled={isResearching || !query.trim()}
          id="start-live-research-btn"
        >
          {isResearching ? (
            <>
              <Loader2 size={16} className="spin" />
              <span>Researching with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Investigate & Generate Guide</span>
            </>
          )}
        </button>
      </div>

      {/* Presets Bar */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Try unfamiliar apps:</span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setQuery(preset);
              handleStartResearch(preset);
            }}
            disabled={isResearching}
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: isResearching ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* 7-Stage Visual Stepper */}
      {(isResearching || currentStageIndex > 0) && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Autonomous 7-Stage Research Progress
            </span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {getProgressPercentage()}% Complete
            </span>
          </div>

          {/* Stepper Track & Circles */}
          <div className="stepper-container" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div className="stepper-track">
              <div className="stepper-progress" style={{ width: `${getProgressPercentage()}%` }} />
            </div>

            {STAGES.map((s) => {
              let circleState = 'pending';
              if (currentStageIndex > s.index || (currentStageIndex === 7 && s.index === 7)) {
                circleState = 'completed';
              } else if (currentStageIndex === s.index && isResearching) {
                circleState = 'active';
              }

              return (
                <div key={s.index} className="step-node" style={{ minWidth: '90px' }}>
                  <div className={`step-circle ${circleState}`}>
                    {circleState === 'completed' ? (
                      <CheckCircle2 size={16} strokeWidth={2.5} />
                    ) : circleState === 'active' ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <span>{s.index}</span>
                    )}
                  </div>
                  <span className={`step-label ${circleState}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Discovered Sources Panel */}
      {discoveredSources.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
            <Globe size={14} color="var(--accent-primary)" />
            <span>Discovered Authentic Documentation Sources ({discoveredSources.length}):</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
            {discoveredSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                  fontSize: '0.82rem',
                  textDecoration: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                  <FileText size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {source.title}
                  </span>
                </div>
                <ExternalLink size={12} color="var(--text-muted)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Live Execution Console */}
      {logs.length > 0 && (
        <div className="terminal-box" style={{ marginBottom: '1.5rem' }}>
          <div className="terminal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="terminal-dots">
                <span className="terminal-dot red" />
                <span className="terminal-dot yellow" />
                <span className="terminal-dot green" />
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                Agent Execution Stream • Google Gemini LLM & Probe Engine
              </span>
            </div>
            {isResearching && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.75rem' }}>
                <Activity size={13} className="spin" />
                <span>Live Stream Active</span>
              </div>
            )}
          </div>

          <div className="terminal-body" id="live-terminal-body">
            {logs.map((log, idx) => (
              <div key={idx} className={`log-line ${log.type}`}>
                <span style={{ color: 'var(--text-muted)', marginRight: '0.65rem' }}>[{log.timestamp}]</span>
                <span>{log.text}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* Error Message Alert */}
      {errorMessage && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{errorMessage}</span>
        </div>
      )}

      {/* Success Completion Action Card */}
      {generatedGuide && !isResearching && (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #eef2ff 100%)',
            border: '1px solid #a7f3d0',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#047857', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              <CheckCircle2 size={18} />
              <span>Standardized Guide Ready for {generatedGuide.provider.name}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              All 6 sections (A through F) successfully populated, scrubbed for secrets, and saved to the guide store.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => onGuideGenerated(generatedGuide)}
            id="open-generated-guide-btn"
          >
            <span>Open Standardized Guide</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
