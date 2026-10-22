import { z } from 'zod';

/**
 * Explicit verification states as defined in the Product Requirements & Architecture.
 */
export type VerificationStatus =
  | 'Documented'
  | 'Configuration Checked'
  | 'Tested'
  | 'Estimated'
  | 'Unverified'
  | 'Blocked';

/**
 * Section A: Provider & Platform Identification
 */
export interface OAuthProviderInfo {
  name: string;
  officialWebsite: string;
  developerPortal: string;
  authMethod: string;
  managedOAuthAvailable: boolean;
  category?: string;
  logoUrl?: string;
}

/**
 * Section A: Readiness & Launch Dependencies
 */
export type ReadinessStatus =
  | 'Ready to start'
  | 'Ready to begin'
  | 'Blocked by prerequisite'
  | 'Prerequisites missing'
  | 'Provider review required'
  | 'Important requirements unverified';

export interface StructuredLaunchBlocker {
  whatIsBlocked: string;
  whenItApplies: string;
  howToResolve: string;
}

export interface ReadinessInfo {
  difficulty: 'Easy' | 'Moderate' | 'Complex' | 'Advanced';
  handsOnEffort: string;
  externalWaitingTime: string;
  // Specific split estimates
  providerSetupTime?: string; // Hands-on time: e.g. "10–15 minutes (console setup & credential creation)"
  integrationTestingTime?: string; // Hands-on time: e.g. "20–30 minutes (redirect handler & code exchange)"
  externalReviewTime?: string; // Waiting time: e.g. "0 days (self-serve) / 3–5 days (app review if public)"
  readinessStatus?: ReadinessStatus; // Actionable status based on actual findings
  importantBeforeYouStart?: string; // High-leverage decision/prerequisite guidance
  launchBlockers: string[];
  structuredBlockers?: StructuredLaunchBlocker[]; // Granular blocker details: what, when, resolution
}

/**
 * Section B: Prerequisites
 */
export type PrerequisiteRequirementLevel = 'Required' | 'Recommended' | 'Conditional';

export interface PrerequisiteItem {
  category: 'Account Access' | 'Project Setup' | 'Domain & URLs' | 'Credentials & Scopes' | 'Assets & Documents';
  description: string;
  required: boolean;
  condition?: string;
  requirementLevel?: PrerequisiteRequirementLevel; // 'Required' | 'Recommended' | 'Conditional'
  whyNeeded?: string; // Plain-English purpose: why this item is essential
  localExceptions?: string; // Local-development exception (e.g. localhost supported without HTTPS)
  unblocksStepNumbers?: number[]; // Step numbers in Section C that become unblocked
}

/**
 * Section C: Ordered Step-by-Step Instructions
 */
export type StepCompletionState =
  | 'Not started'
  | 'In progress'
  | 'Completed'
  | 'Configuration checked'
  | 'Documented'
  | 'Tested'
  | 'Blocked';

export interface SetupStep {
  stepNumber: number;
  title: string;
  purpose: string;
  instructions: string; // What exactly to do
  inputsRequired: string[]; // Specific inputs needed
  expectedOutcome: string; // What should happen after completing the step
  howToVerify?: string; // How to verify it worked (test/check instructions)
  whereToGo?: string; // Where do I go? Exact console location or direct link
  isConditional?: boolean; // Whether this step applies conditionally
  conditionDescription?: string; // Why/when this step applies or can be skipped
  sourceUrl?: string; // Exact official doc reference
  evidenceStatus: VerificationStatus; // Honest status: Documented, Configuration Checked, Tested, etc.
  completionState?: StepCompletionState; // Developer completion state: Not started, In progress, Completed, etc.
  dependencies: number[]; // Step numbers this step depends upon
  commandOrSnippet?: string; // Code snippet with sensitive credentials redacted
}

/**
 * Section D: Verification & Production Readiness
 */
export interface LaunchChecklistItem {
  checkItem: string;
  condition: string;
  actionRequired: string;
  evidenceSourceUrl?: string;
  isMandatory?: boolean;
}

export interface TimelineEvidence {
  publishedEstimate: string;
  sourceUrl?: string;
  dateChecked?: string;
  isGuarantee?: boolean;
  timelineNotes?: string;
}

export interface VerificationReviewInfo {
  testingModeSupported: boolean;
  testingRestrictions: string;
  verificationTriggers: string[];
  requiredDocumentation: string[];
  publishedReviewTimelines: string;
  unknowns: string[];
  // Enhanced Section D Fields
  testingPossibleNow?: boolean;
  testingEnvironmentDetails?: string;
  additionalProductionRequirements?: string;
  marketplaceReviewApplicable?: boolean;
  reviewTriggerExplanation?: string;
  timelineEvidence?: TimelineEvidence;
  launchChecklist?: LaunchChecklistItem[];
}

/**
 * Section E: Testing & Troubleshooting Runbook
 */
export type TroubleshootingVerificationBadge = 'Documented' | 'Reproduced in Testing' | 'Likely Cause';

export interface TroubleshootingScenario {
  errorCode: string;
  description: string;
  probableCauses: string[];
  resolution: string;
  verifiedInTesting?: boolean;
  // Enhanced Section E Fields
  symptom?: string;
  diagnosis?: string;
  verification?: string;
  escalationPath?: string;
  troubleshootingStatus?: TroubleshootingVerificationBadge;
}

/**
 * Section F: Agent Research Findings & Citations
 */
export interface EvidenceClaimItem {
  claim: string;
  evidenceUrl: string;
  sourceTitle: string;
  relevance?: string;
}

export interface AttemptedTestDetails {
  test: string;
  endpoint?: string;
  status: 'Success' | 'Failed' | 'Skipped' | 'Informational';
  observedResult: string;
  // Enhanced Section F Fields
  whyChecked?: string;
  whatItEstablishes?: string;
  whatItDoesNotEstablish?: string;
}

export interface ContextualHandOff {
  action: string;
  reason: string;
  prerequisite: string;
  successCondition: string;
}

export interface DynamicNextAction {
  action: string;
  reason: string;
  prerequisite: string;
  successCondition: string;
  sourceType: 'prerequisite' | 'step' | 'complete';
  sourceNumber?: number;
  statusBadge: string;
}

export interface AgentFindingDetails {
  sourcesConsulted: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
  requirementsExtractedSummary: string[];
  configurationChecksPerformed: string[];
  testsAttempted: AttemptedTestDetails[];
  unverifiedClaims: string[];
  humanActionRequired: string[];
  nextRecommendedAction: string;
  // Enhanced Section F Fields
  dynamicNextAction?: DynamicNextAction;
  evidenceClaims?: EvidenceClaimItem[];
  contextualHandOff?: ContextualHandOff;
}

/**
 * Standardized 6-Section Guide Model (Sections A-F)
 */
export interface GuideSchema {
  id: string;
  slug: string;
  provider: OAuthProviderInfo;
  readiness: ReadinessInfo;
  prerequisites: PrerequisiteItem[];
  steps: SetupStep[];
  verification: VerificationReviewInfo;
  troubleshooting: TroubleshootingScenario[];
  agentFindings: AgentFindingDetails;
  metadata: {
    generatedAt: string;
    updatedAt?: string;
    schemaVersion: string;
    isCurated: boolean;
    shareUrl?: string;
  };
}

/**
 * Typed streaming events emitted during autonomous research
 */
export type ResearchStage =
  | 'identifying'
  | 'discovering_sources'
  | 'extracting_requirements'
  | 'reconstructing_workflow'
  | 'probing_endpoints'
  | 'synthesizing_guide'
  | 'completed'
  | 'error';

export interface ResearchProgressEvent {
  jobId: string;
  stage: ResearchStage;
  stageIndex: number; // 1 to 7
  message: string;
  details?: string;
  discoveredSources?: Array<{ title: string; url: string }>;
  probeResult?: {
    test: string;
    endpoint?: string;
    status: string;
    observedResult: string;
  };
  guide?: GuideSchema;
  error?: string;
  timestamp: string;
}

// ==========================================
// Zod Schemas for Runtime Validation & Gemini
// ==========================================

export const VerificationStatusSchema = z.enum([
  'Documented',
  'Configuration Checked',
  'Tested',
  'Estimated',
  'Unverified',
  'Blocked',
]);

export const OAuthProviderInfoSchema = z.object({
  name: z.string(),
  officialWebsite: z.string(),
  developerPortal: z.string(),
  authMethod: z.string(),
  managedOAuthAvailable: z.boolean(),
  category: z.string().optional(),
  logoUrl: z.string().optional(),
});

export const ReadinessStatusSchema = z.enum([
  'Ready to start',
  'Ready to begin',
  'Blocked by prerequisite',
  'Prerequisites missing',
  'Provider review required',
  'Important requirements unverified',
]);

export const StructuredLaunchBlockerSchema = z.object({
  whatIsBlocked: z.string(),
  whenItApplies: z.string(),
  howToResolve: z.string(),
});

export const ReadinessInfoSchema = z.object({
  difficulty: z.enum(['Easy', 'Moderate', 'Complex', 'Advanced']),
  handsOnEffort: z.string(),
  externalWaitingTime: z.string(),
  providerSetupTime: z.string().optional(),
  integrationTestingTime: z.string().optional(),
  externalReviewTime: z.string().optional(),
  readinessStatus: ReadinessStatusSchema.optional(),
  importantBeforeYouStart: z.string().optional(),
  launchBlockers: z.array(z.string()),
  structuredBlockers: z.array(StructuredLaunchBlockerSchema).optional(),
});

export const PrerequisiteRequirementLevelSchema = z.enum([
  'Required',
  'Recommended',
  'Conditional',
]);

export const PrerequisiteItemSchema = z.object({
  category: z.enum([
    'Account Access',
    'Project Setup',
    'Domain & URLs',
    'Credentials & Scopes',
    'Assets & Documents',
  ]),
  description: z.string(),
  required: z.boolean(),
  condition: z.string().optional(),
  requirementLevel: PrerequisiteRequirementLevelSchema.optional(),
  whyNeeded: z.string().optional(),
  localExceptions: z.string().optional(),
  unblocksStepNumbers: z.array(z.number()).optional(),
});

export const StepCompletionStateSchema = z.enum([
  'Not started',
  'In progress',
  'Completed',
  'Configuration checked',
  'Documented',
  'Tested',
  'Blocked',
]);

export const SetupStepSchema = z.object({
  stepNumber: z.number(),
  title: z.string(),
  purpose: z.string(),
  instructions: z.string(),
  inputsRequired: z.array(z.string()),
  expectedOutcome: z.string(),
  howToVerify: z.string().optional(),
  whereToGo: z.string().optional(),
  isConditional: z.boolean().optional(),
  conditionDescription: z.string().optional(),
  sourceUrl: z.string().optional(),
  evidenceStatus: VerificationStatusSchema,
  completionState: StepCompletionStateSchema.optional(),
  dependencies: z.array(z.number()),
  commandOrSnippet: z.string().optional(),
});

export const LaunchChecklistItemSchema = z.object({
  checkItem: z.string(),
  condition: z.string(),
  actionRequired: z.string(),
  evidenceSourceUrl: z.string().optional(),
  isMandatory: z.boolean().optional(),
});

export const TimelineEvidenceSchema = z.object({
  publishedEstimate: z.string(),
  sourceUrl: z.string().optional(),
  dateChecked: z.string().optional(),
  isGuarantee: z.boolean().optional(),
  timelineNotes: z.string().optional(),
});

export const VerificationReviewInfoSchema = z.object({
  testingModeSupported: z.boolean(),
  testingRestrictions: z.string(),
  verificationTriggers: z.array(z.string()),
  requiredDocumentation: z.array(z.string()),
  publishedReviewTimelines: z.string(),
  unknowns: z.array(z.string()),
  testingPossibleNow: z.boolean().optional(),
  testingEnvironmentDetails: z.string().optional(),
  additionalProductionRequirements: z.string().optional(),
  marketplaceReviewApplicable: z.boolean().optional(),
  reviewTriggerExplanation: z.string().optional(),
  timelineEvidence: TimelineEvidenceSchema.optional(),
  launchChecklist: z.array(LaunchChecklistItemSchema).optional(),
});

export const TroubleshootingScenarioSchema = z.object({
  errorCode: z.string(),
  description: z.string(),
  probableCauses: z.array(z.string()),
  resolution: z.string(),
  verifiedInTesting: z.boolean().optional(),
  symptom: z.string().optional(),
  diagnosis: z.string().optional(),
  verification: z.string().optional(),
  escalationPath: z.string().optional(),
  troubleshootingStatus: z.enum(['Documented', 'Reproduced in Testing', 'Likely Cause']).optional(),
});

export const EvidenceClaimItemSchema = z.object({
  claim: z.string(),
  evidenceUrl: z.string(),
  sourceTitle: z.string(),
  relevance: z.string().optional(),
});

export const ContextualHandOffSchema = z.object({
  action: z.string(),
  reason: z.string(),
  prerequisite: z.string(),
  successCondition: z.string(),
});

export const DynamicNextActionSchema = z.object({
  action: z.string(),
  reason: z.string(),
  prerequisite: z.string(),
  successCondition: z.string(),
  sourceType: z.enum(['prerequisite', 'step', 'complete']),
  sourceNumber: z.number().optional(),
  statusBadge: z.string(),
});

export const AgentFindingDetailsSchema = z.object({
  sourcesConsulted: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string().optional(),
    })
  ),
  requirementsExtractedSummary: z.array(z.string()),
  configurationChecksPerformed: z.array(z.string()),
  testsAttempted: z.array(
    z.object({
      test: z.string(),
      endpoint: z.string().optional(),
      status: z.enum(['Success', 'Failed', 'Skipped', 'Informational']),
      observedResult: z.string(),
      whyChecked: z.string().optional(),
      whatItEstablishes: z.string().optional(),
      whatItDoesNotEstablish: z.string().optional(),
    })
  ),
  unverifiedClaims: z.array(z.string()),
  humanActionRequired: z.array(z.string()),
  nextRecommendedAction: z.string(),
  dynamicNextAction: DynamicNextActionSchema.optional(),
  evidenceClaims: z.array(EvidenceClaimItemSchema).optional(),
  contextualHandOff: ContextualHandOffSchema.optional(),
});

export const FullGuideZodSchema = z.object({
  id: z.string(),
  slug: z.string(),
  provider: OAuthProviderInfoSchema,
  readiness: ReadinessInfoSchema,
  prerequisites: z.array(PrerequisiteItemSchema),
  steps: z.array(SetupStepSchema),
  verification: VerificationReviewInfoSchema,
  troubleshooting: z.array(TroubleshootingScenarioSchema),
  agentFindings: AgentFindingDetailsSchema,
  metadata: z.object({
    generatedAt: z.string(),
    updatedAt: z.string().optional(),
    schemaVersion: z.string(),
    isCurated: z.boolean(),
    shareUrl: z.string().optional(),
  }),
});
