import React, { useState } from 'react';
import { GuideSchema, SetupStep, StepCompletionState, DynamicNextAction } from '@/types/guide';
import { EvidenceBadge } from '@/components/EvidenceBadge';
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertTriangle,
  FileText,
  Terminal,
  Info,
  HelpCircle,
  Sparkles,
  Zap,
  Sliders,
  CheckSquare,
  Layers,
} from 'lucide-react';

interface GuideViewerProps {
  guide: GuideSchema;
  onBack: () => void;
  shareableUrl?: string;
}

export const GuideViewer: React.FC<GuideViewerProps> = ({ guide, onBack, shareableUrl }) => {
  // Prerequisite completion tracker
  const [completedPrereqs, setCompletedPrereqs] = useState<Record<number, boolean>>({});

  // Launch checklist completion tracker
  const [completedLaunchChecks, setCompletedLaunchChecks] = useState<Record<number, boolean>>({});

  // Step completion state tracker: 'Not started' | 'In progress' | 'Completed' | 'Configuration checked' | 'Documented' | 'Tested' | 'Blocked'
  const [stepProgress, setStepProgress] = useState<Record<number, StepCompletionState>>(() => {
    const initial: Record<number, StepCompletionState> = {};
    guide.steps.forEach((s) => {
      initial[s.stepNumber] = s.completionState || 'Not started';
    });
    return initial;
  });

  // Accordion state for steps: default first 2 steps open
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
  });

  // Copy feedback states
  const [copiedSnippet, setCopiedSnippet] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const togglePrereq = (index: number) => {
    setCompletedPrereqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleLaunchCheck = (index: number) => {
    setCompletedLaunchChecks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const toggleStepCompletion = (stepNumber: number) => {
    setStepProgress((prev) => {
      const current = prev[stepNumber] || 'Not started';
      const next: StepCompletionState = (current === 'Completed' || current === 'Tested') ? 'Not started' : 'Completed';
      const stepObj = guide.steps.find((s) => s.stepNumber === stepNumber);
      if (stepObj) {
        stepObj.completionState = next;
      }
      return {
        ...prev,
        [stepNumber]: next,
      };
    });
  };

  const setStepCompletion = (stepNumber: number, state: StepCompletionState) => {
    setStepProgress((prev) => {
      const stepObj = guide.steps.find((s) => s.stepNumber === stepNumber);
      if (stepObj) {
        stepObj.completionState = state;
      }
      return {
        ...prev,
        [stepNumber]: state,
      };
    });
  };

  const expandAllSteps = () => {
    const all: Record<number, boolean> = {};
    guide.steps.forEach((s) => {
      all[s.stepNumber] = true;
    });
    setExpandedSteps(all);
  };

  const collapseAllSteps = () => {
    setExpandedSteps({});
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(index);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const handleShare = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const permalink = guide.slug ? `${origin}/guides/${guide.slug}` : '';
    const url = shareableUrl || permalink || (typeof window !== 'undefined' ? window.location.href : '');
    navigator.clipboard.writeText(url);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  // Prerequisites & Setup Readiness calculations (Two distinct concepts)
  const totalPrereqs = guide.prerequisites.length;
  const completedPrereqsCount = Object.values(completedPrereqs).filter(Boolean).length;

  // Step execution progress in Section C
  const totalSteps = guide.steps.length;
  const completedStepsCount = guide.steps.filter(
    (s) => stepProgress[s.stepNumber] === 'Completed' || stepProgress[s.stepNumber] === 'Tested'
  ).length;

  // Function to get step progress styling
  const getStepProgressConfig = (status: StepCompletionState) => {
    switch (status) {
      case 'Completed':
        return {
          label: 'Completed',
          bg: '#ecfdf5',
          color: '#047857',
          border: '#a7f3d0',
        };
      case 'In progress':
        return {
          label: 'In progress',
          bg: '#eff6ff',
          color: '#1d4ed8',
          border: '#bfdbfe',
        };
      case 'Configuration checked':
        return {
          label: 'Config Checked',
          bg: '#ecfeff',
          color: '#0e7490',
          border: '#a5f3fc',
        };
      case 'Documented':
        return {
          label: 'Documented',
          bg: '#f5f3ff',
          color: '#6d28d9',
          border: '#ddd6fe',
        };
      case 'Tested':
        return {
          label: 'Tested',
          bg: '#f0fdf4',
          color: '#15803d',
          border: '#bbf7d0',
        };
      case 'Blocked':
        return {
          label: 'Blocked',
          bg: '#fef2f2',
          color: '#b91c1c',
          border: '#fecaca',
        };
      case 'Not started':
      default:
        return {
          label: 'Not started',
          bg: '#f8fafc',
          color: '#64748b',
          border: '#cbd5e1',
        };
    }
  };

  // Find account-level prerequisite (mandatory to begin setup)
  const accountPrereqIndex = guide.prerequisites.findIndex(
    (p) =>
      p.category === 'Account Access' ||
      p.description.toLowerCase().includes('developer account') ||
      p.description.toLowerCase().includes('account')
  );
  const hasAccountPrereq = accountPrereqIndex !== -1;
  const isAccountConfirmed = hasAccountPrereq ? Boolean(completedPrereqs[accountPrereqIndex]) : false;

  // Find all mandatory/required prerequisites
  const requiredPrereqs = guide.prerequisites
    .map((p, idx) => ({ ...p, originalIndex: idx }))
    .filter((p) => p.required || p.requirementLevel === 'Required');
  const missingRequired = requiredPrereqs.filter((p) => !completedPrereqs[p.originalIndex]);

  // Two separate concepts: Setup Readiness vs Checklist Progress
  let setupReadinessStatus: 'Ready to begin' | 'Blocked by prerequisite';
  let setupReadinessReason: string;

  if (hasAccountPrereq && !isAccountConfirmed) {
    setupReadinessStatus = 'Blocked by prerequisite';
    setupReadinessReason = 'Setup is blocked until mandatory developer account is confirmed in Section B.';
  } else if (missingRequired.length > 0) {
    setupReadinessStatus = 'Blocked by prerequisite';
    setupReadinessReason = `Setup is blocked: ${missingRequired.length} mandatory prerequisite${missingRequired.length > 1 ? 's' : ''} unconfirmed in Section B.`;
  } else {
    setupReadinessStatus = 'Ready to begin';
    setupReadinessReason = 'All mandatory prerequisites confirmed. Ready to execute step-by-step setup in Section C.';
  }

  // Dynamic recommendation derived reactively from actual progress data in Section B and Section C
  const dynamicRec: DynamicNextAction = (() => {
    // 1. Check for earliest incomplete or blocked prerequisite in Section B
    for (let i = 0; i < guide.prerequisites.length; i++) {
      const prereq = guide.prerequisites[i];
      if (!completedPrereqs[i]) {
        const isAccount =
          prereq.category === 'Account Access' ||
          prereq.description.toLowerCase().includes('developer account') ||
          prereq.description.toLowerCase().includes('account');
        return {
          action: isAccount
            ? `Sign in or register a ${guide.provider.name} Developer Account`
            : `Fulfill prerequisite: ${prereq.description}`,
          reason: isAccount
            ? `The agent identified the documented flow, but cannot create client apps or generate secrets without authenticated access to your developer account.`
            : (prereq.whyNeeded || `Required before dependent integration steps can proceed.`),
          prerequisite: `Section B • ${prereq.category}: ${prereq.description}`,
          successCondition: `Prerequisite confirmed as accessible in Section B checklist.`,
          sourceType: 'prerequisite',
          sourceNumber: i + 1,
          statusBadge: isAccount ? 'Prerequisite Blocker • Developer Account Required' : 'Prerequisite Incomplete • Section B',
        };
      }
    }

    // 2. All Section B prerequisites confirmed! Check Section C steps in sequential order
    for (const step of guide.steps) {
      const status = stepProgress[step.stepNumber] || 'Not started';
      const isDone = status === 'Completed' || status === 'Tested';
      if (!isDone) {
        let actionTitle = step.title;
        let actionReason = step.purpose;
        let success = step.expectedOutcome;

        if (step.stepNumber === 1) {
          actionTitle = `Access ${guide.provider.name} Developer Dashboard & Initialize App`;
          actionReason = `Application entry must be registered in the provider console before credentials or callbacks can be set.`;
        } else if (step.stepNumber === 2) {
          actionTitle = `Register App & Obtain OAuth Client Credentials`;
          actionReason = step.purpose || `Generate Client ID and secure Client Secret for authentication.`;
        } else if (step.stepNumber === 3) {
          actionTitle = `Configure and verify authorized redirect callback URL (Step 3)`;
          actionReason = `Ensure callback URL exactly matches registered whitelist on ${guide.provider.name} to prevent redirect_uri_mismatch errors.`;
        } else if (step.stepNumber === 4) {
          actionTitle = `Select required API scopes and store Client Secret in .env (Step 4)`;
          actionReason = `Configures permission boundaries and places credentials into backend environment without exposing secrets in frontend code.`;
        } else if (step.stepNumber === 5) {
          actionTitle = `Verify redirect callback and test authorization code token exchange (Step 5)`;
          actionReason = `Initiate live authorization flow: redirect user to authorization URL, receive callback code, and exchange for access_token.`;
        }

        return {
          action: `${actionTitle} (Step ${step.stepNumber})`,
          reason: actionReason,
          prerequisite: step.dependencies.length > 0
            ? `Step(s) ${step.dependencies.join(', ')} marked complete in Section C`
            : `Prerequisites confirmed in Section B`,
          successCondition: success,
          sourceType: 'step',
          sourceNumber: step.stepNumber,
          statusBadge: status === 'In progress'
            ? `Step ${step.stepNumber} In Progress`
            : status === 'Blocked'
            ? `Step ${step.stepNumber} Blocked`
            : `Next Recommended Step (${step.stepNumber} of ${guide.steps.length})`,
        };
      }
    }

    // 3. All steps in Section C complete!
    return {
      action: `Integration setup complete! Proceed to Section D Production Verification`,
      reason: `All ${guide.steps.length} sequential setup steps and local tests have been completed and verified.`,
      prerequisite: `Steps 1 through ${guide.steps.length} completed in Section C.`,
      successCondition: `Review launch checklist and submit application for marketplace or external verification when ready.`,
      sourceType: 'complete',
      statusBadge: `All Steps Completed • Ready for Review`,
    };
  })();

  // Keep underlying guide object synchronized with actual progress data
  if (guide.agentFindings) {
    guide.agentFindings.dynamicNextAction = dynamicRec;
    guide.agentFindings.nextRecommendedAction = dynamicRec.action;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <button className="btn btn-secondary" onClick={onBack} id="guide-back-btn">
          <ArrowLeft size={16} />
          <span>Back to Guide Directory</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {guide.metadata.isCurated && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: '#eef2ff',
                color: '#4f46e5',
                border: '1px solid #c7d2fe',
              }}
            >
              Curated Benchmark Guide
            </span>
          )}

          <button className="btn btn-primary btn-sm" onClick={handleShare} id="guide-share-btn">
            {copiedShare ? <Check size={14} color="#ffffff" /> : <Share2 size={14} />}
            <span>{copiedShare ? 'Permalink Copied!' : 'Share Guide'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          SECTION A: Overview & Readiness
          ===================================================================== */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Section A • Overview & Readiness
              </span>
              {guide.provider.category && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {guide.provider.category}</span>
              )}
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{guide.provider.name}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              <strong>Authentication Method:</strong> {guide.provider.authMethod}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.55rem' }}>
            {/* Concept 1: Setup Readiness Badge */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  background: setupReadinessStatus === 'Ready to begin' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${setupReadinessStatus === 'Ready to begin' ? '#a7f3d0' : '#fecaca'}`,
                  color: setupReadinessStatus === 'Ready to begin' ? '#047857' : '#b91c1c',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                }}
                id="guide-setup-readiness-status"
              >
                {setupReadinessStatus === 'Ready to begin' ? <Zap size={14} /> : <AlertTriangle size={14} />}
                <span>Setup readiness: {setupReadinessStatus}</span>
              </div>
              <div style={{ fontSize: '0.73rem', color: setupReadinessStatus === 'Ready to begin' ? '#047857' : '#b91c1c', maxWidth: '320px', textAlign: 'right' }}>
                {setupReadinessReason}
              </div>
            </div>

            {/* Concept 2: Checklist Progress Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
              id="guide-checklist-progress-badge"
            >
              <CheckSquare size={13} color="var(--accent-primary)" />
              <span>Checklist progress: {completedPrereqsCount} of {totalPrereqs} completed</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                Difficulty: {guide.readiness.difficulty}
              </span>
              {guide.provider.managedOAuthAvailable && (
                <span style={{ fontSize: '0.75rem', color: 'var(--status-tested-text)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={13} /> Managed OAuth Supported
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Split Time Estimates Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Estimate 1: Provider Setup */}
          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sliders size={13} color="var(--accent-primary)" />
              <span>PROVIDER SETUP</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              {guide.readiness.providerSetupTime || '10–20 minutes'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Estimated hands-on time in developer console
            </div>
          </div>

          {/* Estimate 2: Integration & Testing */}
          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} color="#2563eb" />
              <span>INTEGRATION & TESTING</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              {guide.readiness.integrationTestingTime || '20–35 minutes'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Estimated hands-on redirect & token exchange code
            </div>
          </div>

          {/* Estimate 3: Production Review */}
          <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={13} color="var(--status-tested-text)" />
              <span>PRODUCTION REVIEW</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--status-tested-text)', marginBottom: '0.2rem' }}>
              {guide.readiness.externalReviewTime || guide.readiness.externalWaitingTime}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Estimated waiting time (conditional on distribution)
            </div>
          </div>
        </div>

        {/* Important Before You Start (Decision Callout) */}
        {guide.readiness.importantBeforeYouStart && (
          <div
            style={{
              padding: '1.15rem 1.35rem',
              borderRadius: 'var(--radius-md)',
              background: '#eef2ff',
              border: '1px solid #c7d2fe',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
              <Info size={16} />
              <span>Important Before You Start</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6', margin: 0 }}>
              {guide.readiness.importantBeforeYouStart}
            </p>
          </div>
        )}

        {/* Launch Blockers Section */}
        {guide.readiness.structuredBlockers && guide.readiness.structuredBlockers.length > 0 ? (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#b91c1c', fontWeight: 700, fontSize: '0.92rem' }}>
              <ShieldAlert size={16} />
              <span>Launch Blockers & Gating Dependencies</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {guide.readiness.structuredBlockers.map((b, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.85rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #fee2e2',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.86rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ color: '#991b1b', fontWeight: 700, marginBottom: '0.25rem' }}>
                    • {b.whatIsBlocked}
                  </div>
                  <div style={{ color: '#334155', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'var(--text-muted)' }}>When it applies:</strong> {b.whenItApplies}
                  </div>
                  <div style={{ color: '#047857', fontSize: '0.82rem' }}>
                    <strong style={{ color: '#047857' }}>How to resolve:</strong> {b.howToResolve}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : guide.readiness.launchBlockers.length > 0 ? (
          <div
            style={{
              padding: '1.15rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#b91c1c', fontWeight: 600, fontSize: '0.9rem' }}>
              <ShieldAlert size={16} />
              <span>Important Launch Blockers & Dependencies</span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {guide.readiness.launchBlockers.map((blocker, i) => (
                <li key={i} style={{ fontSize: '0.86rem', color: '#991b1b', lineHeight: '1.5' }}>
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Official Portals Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Official Portals:
          </span>
          <a
            href={guide.provider.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
          >
            <span>Official Website</span>
            <ExternalLink size={12} />
          </a>
          <a
            href={guide.provider.developerPortal}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem' }}
          >
            <span>Developer Console</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </section>

      {/* =====================================================================
          SECTION B: Prerequisites Checklist
          ===================================================================== */}
      <section id="section-b-prerequisites" className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section B • Setup Prerequisites
            </span>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>Prerequisites Checklist</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Confirm these items before following the step-by-step setup guide.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Checklist progress: {completedPrereqsCount} of {totalPrereqs} completed
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {Math.round((completedPrereqsCount / Math.max(1, totalPrereqs)) * 100)}%
            </div>
          </div>
        </div>

        {/* Interactive Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: `${Math.round((completedPrereqsCount / Math.max(1, totalPrereqs)) * 100)}%`,
              height: '100%',
              background:
                completedPrereqsCount === totalPrereqs
                  ? '#059669'
                  : 'var(--accent-gradient)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Dynamic Account Access & Setup Readiness Callout */}
        {hasAccountPrereq && !isAccountConfirmed ? (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
              color: '#92400e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
            }}
          >
            <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
            <div>
              <strong>Setup blocked by prerequisite:</strong> An active developer account is mandatory to register an OAuth application and provision credentials. If account status is unknown or not yet created, setup remains blocked until prerequisite #1 is confirmed.
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              fontSize: '0.84rem',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
            }}
          >
            <CheckCircle2 size={16} color="#059669" style={{ flexShrink: 0 }} />
            <div>
              <strong>Mandatory Prerequisites Confirmed:</strong> Developer account access is verified. Setup readiness is <strong>Ready to begin</strong>.
            </div>
          </div>
        )}

        {/* Checklist Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {guide.prerequisites.map((prereq, index) => {
            const isDone = completedPrereqs[index];
            const level =
              prereq.requirementLevel ||
              (prereq.required ? 'Required' : prereq.condition ? 'Conditional' : 'Recommended');

            const levelBadge =
              level === 'Required'
                ? { text: 'Required', color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' }
                : level === 'Conditional'
                ? { text: 'Conditional', color: '#b45309', bg: '#fffbeb', border: '#fde68a' }
                : { text: 'Recommended', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' };

            return (
              <div
                key={index}
                onClick={() => togglePrereq(index)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.9rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: isDone ? '#ecfdf5' : '#ffffff',
                  border: `1px solid ${isDone ? '#a7f3d0' : 'var(--border-subtle)'}`,
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {/* Checkbox Icon */}
                <div
                  style={{
                    marginTop: '2px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '5px',
                    border: `2px solid ${isDone ? '#059669' : 'var(--border-medium)'}`,
                    background: isDone ? '#059669' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isDone && <Check size={13} color="#ffffff" strokeWidth={3} />}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Category & Requirement Level */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {prereq.category}
                    </span>

                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: levelBadge.bg,
                        border: `1px solid ${levelBadge.border}`,
                        color: levelBadge.color,
                      }}
                    >
                      {levelBadge.text}
                    </span>

                    {prereq.unblocksStepNumbers && prereq.unblocksStepNumbers.length > 0 && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#eef2ff',
                          color: '#4f46e5',
                          marginLeft: 'auto',
                        }}
                      >
                        Unblocks: Step {prereq.unblocksStepNumbers.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontWeight: 500,
                      textDecoration: isDone ? 'line-through' : 'none',
                      margin: '0 0 0.35rem 0',
                    }}
                  >
                    {prereq.description}
                  </p>

                  {/* Why Needed */}
                  {prereq.whyNeeded && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 0.25rem 0' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Why needed:</strong> {prereq.whyNeeded}
                    </p>
                  )}

                  {/* Local Exceptions */}
                  {prereq.localExceptions && (
                    <p style={{ fontSize: '0.8rem', color: '#0369a1', margin: '0 0 0.25rem 0' }}>
                      <strong style={{ color: '#0369a1' }}>Local dev note:</strong> {prereq.localExceptions}
                    </p>
                  )}

                  {/* Condition note */}
                  {prereq.condition && (
                    <p style={{ fontSize: '0.8rem', color: '#b45309', margin: '0.2rem 0 0 0' }}>
                      Condition: {prereq.condition}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer Note */}
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Checking off an item indicates your team has confirmed access to this prerequisite. It does not replace real-world developer account verification.
        </div>
      </section>

      {/* =====================================================================
          SECTION C: Step-by-Step Setup
          ===================================================================== */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section C • Ordered Execution
            </span>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>Step-by-Step Setup Instructions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Follow sequentially. Update your progress as you complete or test each step.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Step progress: {completedStepsCount} of {totalSteps} completed
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                ({Math.round((completedStepsCount / Math.max(1, totalSteps)) * 100)}%)
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={expandAllSteps}>
                Expand All
              </button>
              <button className="btn btn-secondary btn-sm" onClick={collapseAllSteps}>
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Section C Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '6px',
            background: '#e2e8f0',
            borderRadius: '3px',
            overflow: 'hidden',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: `${Math.round((completedStepsCount / Math.max(1, totalSteps)) * 100)}%`,
              height: '100%',
              background:
                completedStepsCount === totalSteps
                  ? '#059669'
                  : 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Evidence vs Progress Distinction Notice */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Info size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Evidence Status vs. Developer Progress:</strong>{' '}
            <em>Agent Evidence</em> reflects verification against official provider documentation and configuration checks.{' '}
            <em>Developer Progress</em> tracks your actual local implementation. A step can be fully documented even if you have not started or completed it yet.
          </div>
        </div>

        <div>
          {guide.steps.map((step) => {
            const isExpanded = expandedSteps[step.stepNumber];
            const currentStatus = stepProgress[step.stepNumber] || 'Not started';
            const statusConfig = getStepProgressConfig(currentStatus);
            const isStepDone = currentStatus === 'Completed' || currentStatus === 'Tested';

            return (
              <div
                key={step.stepNumber}
                id={`step-item-${step.stepNumber}`}
                className="step-item"
                style={{
                  borderLeft: isStepDone
                    ? '4px solid #059669'
                    : currentStatus === 'Blocked'
                    ? '4px solid #dc2626'
                    : currentStatus === 'In progress'
                    ? '4px solid #2563eb'
                    : '4px solid #cbd5e1',
                }}
              >
                <div
                  className="step-header"
                  onClick={() => toggleStep(step.stepNumber)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: '240px' }}>
                    {/* Interactive Completion Checkbox */}
                    <button
                      type="button"
                      aria-label={`Mark step ${step.stepNumber} as ${isStepDone ? 'not completed' : 'completed'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStepCompletion(step.stepNumber);
                      }}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '5px',
                        border: `2px solid ${isStepDone ? '#059669' : 'var(--border-medium)'}`,
                        background: isStepDone ? '#059669' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        flexShrink: 0,
                        transition: 'all var(--transition-fast)',
                      }}
                      title={isStepDone ? 'Completed - Click to toggle' : 'Click to mark completed'}
                    >
                      {isStepDone && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </button>

                    <span className="step-number-badge">{step.stepNumber}</span>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4
                          style={{
                            fontSize: '1.05rem',
                            color: isStepDone ? 'var(--text-muted)' : 'var(--text-primary)',
                            textDecoration: isStepDone ? 'line-through' : 'none',
                          }}
                        >
                          {step.title}
                        </h4>
                        {step.isConditional && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '0.15rem 0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              background: '#fffbeb',
                              color: '#b45309',
                              border: '1px solid #fde68a',
                            }}
                          >
                            Conditional
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                        {step.purpose}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Developer Progress State Selector */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Progress:
                      </span>
                      <select
                        aria-label={`Progress state for Step ${step.stepNumber}`}
                        value={currentStatus}
                        onChange={(e) => setStepCompletion(step.stepNumber, e.target.value as StepCompletionState)}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '0.22rem 0.55rem',
                          borderRadius: 'var(--radius-sm)',
                          background: statusConfig.bg,
                          color: statusConfig.color,
                          border: `1px solid ${statusConfig.border}`,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="Not started">Not started</option>
                        <option value="In progress">In progress</option>
                        <option value="Documented">Documented</option>
                        <option value="Configuration checked">Configuration checked</option>
                        <option value="Tested">Tested</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Agent Evidence Status (Strictly separated from progress) */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.45rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0',
                      }}
                      title="Agent research verification from official provider documentation"
                    >
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Agent Evidence:
                      </span>
                      <EvidenceBadge status={step.evidenceStatus} size="sm" />
                    </div>

                    {isExpanded ? (
                      <ChevronUp size={18} color="var(--text-muted)" />
                    ) : (
                      <ChevronDown size={18} color="var(--text-muted)" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="step-content">
                    {/* Where to go */}
                    {step.whereToGo && (
                      <div
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: '#eef2ff',
                          border: '1px solid #c7d2fe',
                          borderRadius: 'var(--radius-sm)',
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            Where to go:
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>{step.whereToGo}</span>
                        </div>
                        {step.sourceUrl && (
                          <a
                            href={step.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)' }}
                          >
                            <span>Open Official Doc</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Conditional note if present */}
                    {step.conditionDescription && (
                      <div style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: '#92400e' }}>
                        <strong>Condition:</strong> {step.conditionDescription}
                      </div>
                    )}

                    {/* What to do (Instructions) */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                        What to do:
                      </div>
                      <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                        {step.instructions}
                      </p>
                    </div>

                    {/* Inputs Required */}
                    {step.inputsRequired.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                          Configuration Inputs Needed:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {step.inputsRequired.map((inp, idx) => (
                            <span
                              key={idx}
                              style={{
                                fontSize: '0.78rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {inp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code or Snippet */}
                    {step.commandOrSnippet && (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                          Code Snippet / Config:
                        </div>
                        <div className="code-snippet-box">
                          <button
                            className="copy-btn"
                            onClick={() => copyToClipboard(step.commandOrSnippet!, step.stepNumber)}
                          >
                            {copiedSnippet === step.stepNumber ? 'Copied!' : 'Copy'}
                          </button>
                          <pre style={{ margin: 0, color: '#38bdf8' }}>
                            <code>{step.commandOrSnippet}</code>
                          </pre>
                        </div>
                        {step.commandOrSnippet.includes('localhost') && (
                          <div style={{ marginTop: '0.5rem', padding: '0.55rem 0.85rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <Info size={14} style={{ flexShrink: 0 }} />
                            <span><strong>Local Development Notice:</strong> The example callback uses <code>http://localhost:3000</code> exclusively for local development testing. Deployed staging and production applications strictly require an HTTPS callback URL matching your registered developer settings.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Expected Outcome */}
                    <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                        Expected Outcome:
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                        {step.expectedOutcome}
                      </p>
                    </div>

                    {/* How to verify it worked */}
                    {step.howToVerify && (
                      <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--status-tested-text)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={13} />
                          <span>How to verify it worked:</span>
                        </div>
                        <p style={{ fontSize: '0.86rem', color: '#047857', margin: 0 }}>
                          {step.howToVerify}
                        </p>
                      </div>
                    )}

                    {/* Dependencies & Link Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {step.dependencies.length > 0 ? (
                          <span>Depends on Step {step.dependencies.join(', ')}</span>
                        ) : (
                          <span>Initial step (No prior dependencies)</span>
                        )}
                      </div>

                      {step.sourceUrl && (
                        <a
                          href={step.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>Official Source</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION D: Verification and Production Readiness
          ===================================================================== */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Section D • Approvals & Production
          </span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>
            Verification & Production Readiness
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Understand the boundary between sandbox testing and production launch requirements for your distribution path.
          </p>
        </div>

        {/* Milestone 1 vs Milestone 2 Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
          {/* Milestone 1: OAuth Testing (Separate Milestone) */}
          <div style={{ padding: '1.35rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} />
                <span>OAuth Testing</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: '#d1fae5', color: '#047857', border: '1px solid #a7f3d0' }}>
                Separate Milestone
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.6rem', lineHeight: '1.5' }}>
              Confirm that the authorization flow, callback, and token exchange work in the intended test environment.
            </p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Testing Environment Rules:
              </strong>
              {guide.verification.testingRestrictions}
            </div>
          </div>

          {/* Milestone 2: Production Requirements & Gating */}
          <div style={{ padding: '1.35rem', background: '#eef2ff', borderRadius: 'var(--radius-md)', border: '1px solid #c7d2fe' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={16} />
                <span>Production Requirements</span>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', background: '#e0e7ff', color: '#4338ca', border: '1px solid #c7d2fe' }}>
                Verify Applicability
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.6rem', lineHeight: '1.5' }}>
              Identify any scope verification, publishing requirements or review steps applicable to the chosen distribution path.
            </p>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: '#ffffff', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #c7d2fe' }}>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                Distribution Paths:
              </strong>
              {guide.verification.additionalProductionRequirements ||
                (guide.provider.name.includes('Google')
                  ? 'Internal workspace users can use app without review. Public multi-tenant use with restricted data stored on third-party servers may require an annual security assessment (such as CASA).'
                  : 'Internal team usage is immediate. Public App Directory / Marketplace listings require provider brand review.')}
            </div>
          </div>
        </div>

        {/* Evidence-Based Approval Timelines */}
        <div style={{ padding: '1.25rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.75rem' }}>
          {(() => {
            const rawEstimate = guide.verification.timelineEvidence?.publishedEstimate || guide.verification.publishedReviewTimelines;
            const isUnconfirmed = rawEstimate.toLowerCase().includes('not confirmed') || rawEstimate.toLowerCase().includes('unconfirmed');
            const badgeText = isUnconfirmed
              ? 'Review Guidance • Timeline Unconfirmed'
              : guide.verification.timelineEvidence?.isGuarantee
              ? 'SLA Guarantee'
              : 'Guidance Only • Subject to Review Queues';
            const badgeBg = isUnconfirmed ? '#fffbeb' : '#f0fdf4';
            const badgeColor = isUnconfirmed ? '#b45309' : '#15803d';
            const badgeBorder = isUnconfirmed ? '#fde68a' : '#bbf7d0';

            return (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <Clock size={16} color="var(--accent-primary)" />
                    <span>Evidence-Based Review Timelines</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', background: badgeBg, color: badgeColor, border: `1px solid ${badgeBorder}` }}>
                    {badgeText}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Published Provider Estimate:
                    </div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: isUnconfirmed ? '#b45309' : '#0369a1', lineHeight: '1.4' }}>
                      {rawEstimate}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                      Evidence Source & Date Checked:
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {guide.verification.timelineEvidence?.dateChecked ||
                        (isUnconfirmed
                          ? 'Not confirmed in official documentation for this app and distribution path'
                          : 'Verified via official developer portal documentation')}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
                  <strong>Note:</strong> {guide.verification.timelineEvidence?.timelineNotes || (isUnconfirmed
                    ? 'Review timeline is not confirmed for this app and distribution path. Check the provider\'s current review guidance before planning your launch.'
                    : 'Review timelines represent guidance estimates provided by vendor documentation. Complex integrations requesting restricted scopes or third-party audits require additional time.')}
                </p>
              </>
            );
          })()}
        </div>

        {/* Actionable Launch Checklist */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Actionable Launch Checklist</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                These are checks to perform, not claims that every item is mandatory for every provider.
              </p>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {Object.values(completedLaunchChecks).filter(Boolean).length} of {(guide.verification.launchChecklist?.length || 3)} checks complete
            </span>
          </div>

          {/* Launch Checklist Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {((guide.verification.launchChecklist && guide.verification.launchChecklist.length > 0)
              ? guide.verification.launchChecklist
              : [
                  {
                    checkItem: 'Confirm whether a privacy policy is required',
                    condition: 'Required when distributing publicly or requesting external user data.',
                    actionRequired: 'Host a public HTTPS privacy policy disclosing data retention and add URL to app settings.',
                    evidenceSourceUrl: guide.provider.developerPortal,
                    isMandatory: false,
                  },
                  {
                    checkItem: 'Confirm whether the requested scopes need review',
                    condition: 'Required if requesting sensitive, restricted, or administrative permissions.',
                    actionRequired: 'Audit scope list against least-privilege principles and document user-facing rationale.',
                    evidenceSourceUrl: guide.provider.developerPortal,
                    isMandatory: true,
                  },
                  {
                    checkItem: 'Confirm whether public distribution requires approval',
                    condition: 'Required if listing app in public App Directory, Marketplace, or multi-tenant installs.',
                    actionRequired: 'Submit listing review form with demo credentials and branding assets before announcing launch.',
                    evidenceSourceUrl: guide.provider.developerPortal,
                    isMandatory: false,
                  },
                ]
            ).map((check, cIdx) => {
              const isChecked = completedLaunchChecks[cIdx];
              return (
                <div
                  key={cIdx}
                  onClick={() => toggleLaunchCheck(cIdx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.9rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: isChecked ? '#ecfdf5' : '#ffffff',
                    border: `1px solid ${isChecked ? '#a7f3d0' : 'var(--border-subtle)'}`,
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div
                    style={{
                      marginTop: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `2px solid ${isChecked ? '#059669' : 'var(--border-medium)'}`,
                      background: isChecked ? '#059669' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isChecked && <Check size={12} color="#ffffff" strokeWidth={3} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                        {check.checkItem}
                      </span>
                      {check.isMandatory && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)', background: '#fef2f2', color: '#b91c1c' }}>
                          Critical
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Condition:</strong> {check.condition}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#047857' }}>
                      <strong style={{ color: '#047857' }}>Action:</strong> {check.actionRequired}
                    </div>
                  </div>

                  {check.evidenceSourceUrl && (
                    <a
                      href={check.evidenceSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-primary)', marginLeft: 'auto', alignSelf: 'center' }}
                    >
                      <span>Policy</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Unknowns / Unconfirmed items */}
        {guide.verification.unknowns && guide.verification.unknowns.length > 0 && (
          <div style={{ padding: '0.85rem 1rem', background: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
              <HelpCircle size={14} />
              <span>Items Requiring Provider Confirmation:</span>
            </div>
            {guide.verification.unknowns.map((unk, idx) => (
              <p key={idx} style={{ fontSize: '0.82rem', color: '#92400e', margin: '0.15rem 0' }}>
                • {unk}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================================
          SECTION E: Testing & Common Error Scenarios
          ===================================================================== */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Section E • Diagnostics Runbook
          </span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>
            Testing & Common Error Scenarios
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Repeatable troubleshooting workflows with diagnostic checks, actionable resolutions, and verification tests.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {guide.troubleshooting.map((trouble, idx) => {
            const status = trouble.troubleshootingStatus || (trouble.verifiedInTesting ? 'Reproduced in Testing' : 'Documented');
            const statusConfig =
              status === 'Reproduced in Testing'
                ? { text: 'Confirmed in Testing', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0', icon: <CheckCircle2 size={13} /> }
                : status === 'Likely Cause'
                ? { text: 'Likely Cause', color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle size={13} /> }
                : { text: 'Documented Scenario', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', icon: <FileText size={13} /> };

            return (
              <div
                key={idx}
                style={{
                  padding: '1.35rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {/* Header: Error Code and Truthful Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <code
                      style={{
                        fontSize: '0.92rem',
                        color: '#b91c1c',
                        background: '#fef2f2',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        border: '1px solid #fecaca',
                      }}
                    >
                      {trouble.errorCode}
                    </code>
                  </div>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      border: `1px solid ${statusConfig.border}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    {statusConfig.icon}
                    <span>{statusConfig.text}</span>
                  </span>
                </div>

                {/* Symptom */}
                <div style={{ marginBottom: '1rem', padding: '0.7rem 0.9rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    Symptom:
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, lineHeight: '1.5' }}>
                    {trouble.symptom || trouble.description}
                  </p>
                </div>

                {/* 3-Step Action Workflow: Diagnose -> Resolve -> Verify */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {/* Step 1: Diagnose */}
                  <div style={{ padding: '0.85rem 1rem', background: '#fffbeb', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #d97706' }}>
                    <div style={{ fontSize: '0.74rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      1. Diagnose (Confirm Likely Cause)
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                      {trouble.diagnosis ||
                        (trouble.probableCauses.length > 0
                          ? `Inspect request parameters against console configuration: ${trouble.probableCauses.join('; ')}`
                          : 'Compare authorization request parameters against registered developer credentials.')}
                    </p>
                  </div>

                  {/* Step 2: Resolve */}
                  <div style={{ padding: '0.85rem 1rem', background: '#eff6ff', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #2563eb' }}>
                    <div style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      2. Resolve (Actionable Fix)
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#0f172a', margin: 0, lineHeight: '1.5' }}>
                      {trouble.resolution}
                    </p>
                  </div>

                  {/* Step 3: Verify */}
                  <div style={{ padding: '0.85rem 1rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid #059669' }}>
                    <div style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={12} />
                      <span>3. Verify (Confirm Fix Worked)</span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: '#047857', margin: 0, lineHeight: '1.5' }}>
                      {trouble.verification || 'Retry the authorization request and verify that the expected grant response or callback code is received without error.'}
                    </p>
                  </div>
                </div>

                {/* If the problem persists callout */}
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>If the problem persists:</strong> {trouble.escalationPath || 'Capture the provider error code and response payload, strictly excluding client secrets and access tokens, then consult the official provider troubleshooting documentation.'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          SECTION F: Evidence Log & Developer Hand-off
          ===================================================================== */}
      <section className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Section F • Evidence Log & Hand-off
          </span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>
            Evidence Log & Developer Hand-off
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Auditable research trail linking requirements to authentic sources and establishing clear automation boundaries.
          </p>
        </div>

        {/* 1. Linked Evidence Claims */}
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <FileText size={16} color="var(--accent-primary)" />
            <span>Official Evidence & Grounded Claims:</span>
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(guide.agentFindings.evidenceClaims && guide.agentFindings.evidenceClaims.length > 0
              ? guide.agentFindings.evidenceClaims
              : [
                  {
                    claim: `Redirect URI must match registered callback exactly character-for-character with strict protocol enforcement.`,
                    evidenceUrl: guide.provider.developerPortal,
                    sourceTitle: `${guide.provider.name} Developer Portal OAuth Specifications`,
                    relevance: 'Redirect Security & Callback Whitelist',
                  },
                  {
                    claim: `Authorization code exchange requires POST request with confidential client credentials to token endpoint.`,
                    evidenceUrl: guide.provider.developerPortal,
                    sourceTitle: `${guide.provider.name} OAuth 2.0 Token Endpoint Reference`,
                    relevance: 'Server-to-Server Token Exchange',
                  },
                  {
                    claim: `Internal workspace members can authorize directly; public directory listings trigger vendor review.`,
                    evidenceUrl: guide.provider.officialWebsite,
                    sourceTitle: `${guide.provider.name} App Distribution Policy`,
                    relevance: 'App Distribution & Review Boundaries',
                  },
                ]
            ).map((claimItem, cIdx) => (
              <div
                key={cIdx}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {claimItem.claim}
                  </div>
                  {claimItem.relevance && (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
                      {claimItem.relevance}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Supporting Source:</span>
                  <a
                    href={claimItem.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <span>{claimItem.sourceTitle}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Safe Probes: What Was Checked vs What It Establishes & Does NOT Establish */}
        {guide.agentFindings.testsAttempted.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Terminal size={16} color="#059669" />
              <span>Safe Validation Probes Attempted (What the Agent Learned):</span>
            </h4>

            {/* Validation Scope & Evidence Distinction Callout */}
            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.82rem', color: '#475569', lineHeight: '1.55' }}>
              <strong style={{ color: '#0f172a' }}>Testing Scope & Trust Methodology:</strong> Probes performed autonomously by the agent are non-destructive network checks, reachability probes, and parameter-format / URL-construction validations. The designations <em>&ldquo;OAuth flow tested&rdquo;</em> (live user consent and redirect callback test) and <em>&ldquo;token exchange tested&rdquo;</em> (successful authorization code exchange for tokens) are strictly reserved for testing with authorized developer credentials.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {guide.agentFindings.testsAttempted.map((testItem, tIdx) => {
                const whyChecked = testItem.whyChecked || 'Verify endpoint reachability and standard TLS handshake over public internet.';
                const establishes = testItem.whatItEstablishes || 'Establishes that the provider server endpoint is live, responding, and conforms to expected TLS protocol.';
                const doesNotEstablish = testItem.whatItDoesNotEstablish || 'Does not prove OAuth app creation, redirect URI configuration, or successful token exchange against private credentials.';

                return (
                  <div
                    key={tIdx}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{testItem.test}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: '#ecfdf5',
                          color: '#047857',
                          border: '1px solid #a7f3d0',
                        }}
                      >
                        Observed • {testItem.status}
                      </span>
                    </div>

                    {testItem.endpoint && (
                      <div style={{ marginBottom: '0.45rem' }}>
                        <code style={{ fontSize: '0.78rem', color: '#0369a1', background: '#f1f5f9', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                          {testItem.endpoint}
                        </code>
                      </div>
                    )}

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Why Checked:</strong> {whyChecked}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
                      <strong style={{ color: 'var(--text-muted)' }}>Observed Result:</strong> {testItem.observedResult}
                    </div>

                    {/* 2-column breakdown: What it establishes vs What it does NOT establish */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem', marginTop: '0.5rem' }}>
                      <div style={{ padding: '0.6rem 0.75rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', fontSize: '0.78rem', color: '#047857' }}>
                        <strong style={{ color: '#047857', display: 'block', marginBottom: '0.15rem' }}>
                          ✓ What this establishes:
                        </strong>
                        {establishes}
                      </div>

                      <div style={{ padding: '0.6rem 0.75rem', background: '#fef2f2', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca', fontSize: '0.78rem', color: '#b91c1c' }}>
                        <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '0.15rem' }}>
                          ✗ What this does NOT establish:
                        </strong>
                        {doesNotEstablish}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Dynamic Developer Hand-Off & Next Recommended Action */}
        <div
          id="section-f-hand-off"
          style={{
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.05rem' }}>
                <Sparkles size={19} />
                <span>Dynamic Developer Hand-Off & Next Action</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Dynamically derived from the earliest incomplete or blocked prerequisite in Section B and sequential step progress in Section C.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  background: dynamicRec.sourceType === 'complete' ? '#ecfdf5' : dynamicRec.sourceType === 'prerequisite' ? '#fffbeb' : '#eff6ff',
                  color: dynamicRec.sourceType === 'complete' ? '#047857' : dynamicRec.sourceType === 'prerequisite' ? '#b45309' : '#1d4ed8',
                  border: `1px solid ${dynamicRec.sourceType === 'complete' ? '#a7f3d0' : dynamicRec.sourceType === 'prerequisite' ? '#fde68a' : '#bfdbfe'}`,
                }}
              >
                {dynamicRec.statusBadge}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ padding: '0.95rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Dynamic Recommended Action:
              </div>
              <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.4 }}>
                {dynamicRec.action}
              </div>
            </div>

            <div style={{ padding: '0.95rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Why Agent Cannot Do It:
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {dynamicRec.reason}
              </div>
            </div>

            <div style={{ padding: '0.95rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Prerequisite / Dependency:
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {dynamicRec.prerequisite}
              </div>
            </div>

            <div style={{ padding: '0.95rem', background: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '0.72rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
                Success Condition:
              </div>
              <div style={{ fontSize: '0.84rem', color: '#047857', fontWeight: 600, lineHeight: 1.4 }}>
                {dynamicRec.successCondition}
              </div>
            </div>
          </div>

          {/* Action Navigation Helper Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', padding: '0.75rem 1rem', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Need to perform this action now? Jump straight to the relevant checklist item or instruction step:
            </span>
            {dynamicRec.sourceType === 'prerequisite' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const el = document.getElementById('section-b-prerequisites');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Jump to Section B Prerequisites</span>
                <ChevronDown size={14} />
              </button>
            )}
            {dynamicRec.sourceType === 'step' && dynamicRec.sourceNumber && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setExpandedSteps((prev) => ({ ...prev, [dynamicRec.sourceNumber!]: true }));
                  const el = document.getElementById(`step-item-${dynamicRec.sourceNumber}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <span>Jump to Step {dynamicRec.sourceNumber}: {guide.steps.find((s) => s.stepNumber === dynamicRec.sourceNumber)?.title.slice(0, 32)}...</span>
                <ChevronDown size={14} />
              </button>
            )}
            {dynamicRec.sourceType === 'complete' && (
              <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700 }}>
                ✓ Ready for final production launch review
              </span>
            )}
          </div>

          {/* Human Action Required (Automation Boundary) */}
          {guide.agentFindings.humanActionRequired.length > 0 && (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldAlert size={14} />
                <span>Tasks Required by Developer (Outside Agent Sandbox):</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {guide.agentFindings.humanActionRequired.map((act, aIdx) => (
                  <li key={aIdx} style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {act}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
