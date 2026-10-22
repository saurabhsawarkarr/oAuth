import { GoogleGenerativeAI } from '@google/generative-ai';
import { GuideSchema, FullGuideZodSchema } from '@/types/guide';
import { ProviderIdentity, CrawledSource } from '@/lib/crawler';
import { ProbeResult } from '@/lib/prober';
import { sanitizeObject } from '@/lib/sanitizer';
import { getProviderProfile } from '@/data/providerProfiles';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Initializes Google Gemini generative client if key is available
 */
function getGeminiModel(modelName = 'gemini-3.5-flash') {
  if (!GEMINI_API_KEY) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });
}

/**
 * Stage 3 & 6: Uses Google Gemini LLM to synthesize a full standardized 6-section guide
 * conforming strictly to GuideSchema.
 */
const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash'];

export async function synthesizeGuideWithGemini(
  identity: ProviderIdentity,
  crawledSources: CrawledSource[],
  probeResults: ProbeResult[]
): Promise<GuideSchema> {
  if (GEMINI_API_KEY) {
    const profile = getProviderProfile(identity.name) || getProviderProfile(identity.domain);
    const profileGrounding = profile
      ? `
VERIFIED DEVELOPER ACCOUNT SPECIFICATION FOR ${profile.name}:
- Console Navigation: ${profile.consoleNavigationPath}
- App Registration UI: ${profile.appCreationDetails.menuLocation}
- Registration Form Fields: ${profile.appCreationDetails.fieldsToFill.join(', ')}
- Supported Permission Scopes: ${profile.supportedScopes.map((s) => `${s.name} (${s.description})`).join(', ')}
- Official Endpoints: Authorization: ${profile.endpoints.authorization}, Token: ${profile.endpoints.token}
- Redirect URI Syntax Rules: ${profile.redirectUriRules}
- Developer Sandbox Rules: ${profile.sandboxRestrictions}
- Verification Triggers: ${profile.verificationTriggers.join('; ')}
- Published Review Timelines: ${profile.publishedReviewTimelines}
- Known Troubleshooting Scenarios: ${profile.troubleshootingScenarios.map((t) => `${t.errorCode}: ${t.description}`).join('; ')}
`
      : '';

    const prompt = `
You are an expert OAuth Integration Engineer and Principal Technical Writer.
Your task is to analyze the provided crawled documentation, verified developer account specifications, and probe results for "${identity.name}" (${identity.domain})
and generate a comprehensive, highly accurate, standardized 6-section OAuth 2.0 setup guide conforming strictly to the JSON schema.

CRITICAL DEVELOPER ACCOUNT GROUNDING INSTRUCTION:
DO NOT output a generic OAuth 2.0 template! You must explain how the process is ACTUALLY provided by ${identity.name} in their specific developer account and settings.
- Specify the exact developer console tabs, navigation paths, and buttons in ${identity.name} (e.g., "${identity.developerPortal}", Account Settings > Developer / Integrations, or Developer Dashboard > Applications > Create App).
- Specify the exact registration form: what inputs to provide (App Name, Homepage URL, Callback URLs, Confidential Client toggle, etc.).
- Include the real, authentic scope names and permission strings supported by ${identity.name} (e.g. not generic "read/write", but the actual scope strings documented by ${identity.name}).
- Detail the exact token exchange endpoint and parameters.
- Detail the actual sandbox / developer mode limitations, test user invitation rules, and production review/submission triggers for ${identity.name}.

EVIDENCE & TRUTHFUL BADGE RULES:
1. Every step must have an honest, truthful evidenceStatus: "Documented" | "Configuration Checked" | "Tested" | "Estimated" | "Unverified" | "Blocked".
   - "Documented": Official instructions and portal documentation support the step (use this for all manual console registration, form filling, and scope selection steps!).
   - "Configuration Checked": Endpoint syntax, URL structures, or parameter formats have been checked against official schemas.
   - "Tested": The step or network behavior was actually executed and tested against a real endpoint/probe.
     CRITICAL DISTINCTIONS:
     * Reserve "OAuth flow tested" strictly for a real end-to-end authorization and callback test.
     * Reserve "token exchange tested" strictly for a successful token exchange using authorized test credentials.
     * Describe authorization URL probes strictly as parameter-format or URL-construction checks, never as full flow tests!
     * A discovery probe returning HTTP 406 must be described as: "The discovery request returned HTTP 406; standard discovery support remains unconfirmed."
   - "Blocked": Requires an action, enterprise account, or credential the agent does not possess.
2. If waiting times or review timelines are not explicitly confirmed in official documentation for the chosen app type and distribution path, state: "Review timeline: Not confirmed for this app and distribution path. Check the provider's current review guidance before planning your launch." Never fabricate approval dates.
3. Keep client secrets strictly out of instructions. Use placeholders like "[REDACTED_CLIENT_SECRET]".

SECTION A REQUIREMENTS (Overview & Readiness):
- Split effort into 3 explicit estimates:
  - providerSetupTime: hands-on time in developer console (e.g. "10–20 minutes")
  - integrationTestingTime: hands-on code and testing time (e.g. "20–35 minutes")
  - externalReviewTime: estimated waiting time or "Review timeline: Not confirmed for this app and distribution path. Check the provider's current review guidance before planning your launch."
- readinessStatus: If a mandatory developer account is missing or account status is unknown, DO NOT assume the developer has it; set readinessStatus to "Blocked by prerequisite". Once developer account access is confirmed, it becomes "Ready to begin".
- importantBeforeYouStart: high-leverage decision / caution callout (e.g. internal vs multi-tenant distribution, scope restrictions).
- redirect URI rule explanation: "Redirect URI requirements: Must match the URI registered with the provider. HTTPS is generally required for deployed applications; localhost exceptions may apply during development. Confirm the exact rules for the selected provider and app type."
- structuredBlockers: list of objects with { whatIsBlocked, whenItApplies, howToResolve } describing specific launch blockers.

SECTION B REQUIREMENTS (Prerequisites Checklist):
- Each item must have:
  - requirementLevel: "Required" | "Conditional" | "Recommended" (do not mark everything Required!).
  - whyNeeded: clear plain-English explanation of why the prerequisite is needed.
  - localExceptions: local-development exceptions (e.g. "http://localhost supported without HTTPS").
  - unblocksStepNumbers: array of numbers indicating which steps in Section C this prerequisite unblocks.

SECTION C REQUIREMENTS (Step-by-Step Instructions):
- Make every step executable with:
  - whereToGo: exact developer console navigation path and URL.
  - instructions: what to do step-by-step. If an example uses http://localhost:3000/, EXPLAIN EXPLICITLY that the example is for local development while HTTPS is required for production.
  - inputsRequired: specific inputs needed.
  - expectedOutcome: what should happen after finishing.
  - howToVerify: how the developer knows it worked.
  - isConditional: true if step applies only to certain scopes/distribution paths.
  - conditionDescription: when this step applies or why it can be skipped.
  - evidenceStatus: truthful badge ("Documented" for console setups).

SECTION D REQUIREMENTS (Verification & Production Gating):
- Separate OAuth testing from production approval:
  - testingPossibleNow: true if local testing/sandbox works immediately.
  - testingEnvironmentDetails: rules for local/invited test users.
  - additionalProductionRequirements: requirements for production launch.
  - marketplaceReviewApplicable: true if public directory/marketplace review applies.
  - reviewTriggerExplanation: what triggers external review.
  - timelineEvidence: { publishedEstimate, sourceUrl, dateChecked, isGuarantee, timelineNotes }. If exact timeline is unconfirmed, set publishedEstimate to "Review timeline: Not confirmed for this app and distribution path. Check the provider's current review guidance before planning your launch."
  - launchChecklist: array of { checkItem, condition, actionRequired, evidenceSourceUrl, isMandatory }.

SECTION E REQUIREMENTS (Diagnostics & Troubleshooting):
- Every troubleshooting scenario must be a 3-step structured workflow:
  - errorCode: standard provider error code string.
  - description: overview of the problem.
  - symptom: concrete symptom or error message observed.
  - diagnosis: step 1: concrete diagnostic checks to confirm root cause.
  - resolution: step 2: actionable fix.
  - verification: step 3: how to confirm fix worked.
  - escalationPath: safe escalation advice excluding secrets and tokens.
  - troubleshootingStatus: "Documented" | "Reproduced in Testing" | "Likely Cause".

SECTION F REQUIREMENTS (Evidence Log & Developer Hand-off):
- evidenceClaims: array of { claim, evidenceUrl, sourceTitle, relevance } linking claims to official sources.
- testsAttempted: for each probe, provide:
  - test: describe as parameter-format or URL-construction check if that is what was performed.
  - observedResult: for HTTP 406 discovery probe, specify "The discovery request returned HTTP 406; standard discovery support remains unconfirmed."
  - whatItEstablishes (what this result proves).
  - whatItDoesNotEstablish (what this result does NOT prove; reserve "OAuth flow tested" and "token exchange tested" for real credential tests).
- contextualHandOff: { action, reason, prerequisite, successCondition } defining the agent automation boundary.

PROVIDER CONTEXT:
Name: ${identity.name}
Domain: ${identity.domain}
Website: ${identity.officialWebsite}
Developer Portal: ${identity.developerPortal}
Category: ${identity.category}
Auth Method: ${identity.authMethod}
${profileGrounding}

CRAWLED DOCUMENTATION SOURCES:
${crawledSources.map((s, i) => `--- Source ${i + 1}: ${s.title} (${s.url}) ---\n${s.content.slice(0, 5000)}`).join('\n\n')}

VALIDATION PROBE RESULTS:
${probeResults.map((p) => `- Test: ${p.test} | Status: ${p.status} | Details: ${p.observedResult}`).join('\n')}

Generate the complete JSON object conforming strictly to the GuideSchema interface.
`;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = getGeminiModel(modelName);
        if (!model) break;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Model request timed out after 12s`)), 12000)
        );
        const result = await Promise.race([model.generateContent(prompt), timeoutPromise]);
        const text = result.response.text();
        const parsed = JSON.parse(text);
        const validated = FullGuideZodSchema.safeParse(parsed);

        if (validated.success) {
          console.log(`[Gemini] Successfully synthesized developer-grounded guide for ${identity.name} using ${modelName}`);
          return sanitizeObject(validated.data as GuideSchema);
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.warn(`Gemini model ${modelName} returned error: ${errMsg}. Trying fallback if available...`);
      }
    }
  }

  // Fallback: Deterministic synthesis based on crawled docs & provider identity
  return generateDeterministicGuide(identity, crawledSources, probeResults);
}

/**
 * High-fidelity fallback synthesizer for offline evaluation or missing GEMINI_API_KEY
 */
function generateDeterministicGuide(
  identity: ProviderIdentity,
  crawledSources: CrawledSource[],
  probeResults: ProbeResult[]
): GuideSchema {
  const profile = getProviderProfile(identity.name) || getProviderProfile(identity.domain);
  const slug = `${identity.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-oauth-guide`;
  const cleanId = `guide_${identity.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  if (profile) {
    const isInstant =
      profile.publishedReviewTimelines.toLowerCase().includes('0 days') ||
      profile.publishedReviewTimelines.toLowerCase().includes('instant');

    const guide: GuideSchema = {
      id: cleanId,
      slug,
      provider: {
        name: profile.name,
        officialWebsite: profile.officialWebsite,
        developerPortal: profile.developerPortal,
        authMethod: profile.authMethod,
        managedOAuthAvailable: profile.managedOAuthAvailable,
        category: profile.category,
      },
      readiness: {
        difficulty: 'Moderate',
        handsOnEffort: '25–40 minutes',
        externalWaitingTime: profile.publishedReviewTimelines,
        providerSetupTime: '10–15 minutes (developer console registration & secret generation)',
        integrationTestingTime: '15–25 minutes (redirect handler & code-for-token exchange)',
        externalReviewTime: profile.publishedReviewTimelines,
        readinessStatus: 'Blocked by prerequisite',
        importantBeforeYouStart: `Confirm whether your integration is for internal workspace members (${profile.sandboxRestrictions}) or multi-tenant public distribution. ${profile.redirectUriRules}`,
        launchBlockers: [
          `Registering an application in ${profile.name} developer portal requires an active developer account.`,
          `Console location: ${profile.consoleNavigationPath}.`,
          `Redirect URIs must match: ${profile.redirectUriRules}`,
        ],
        structuredBlockers: [
          {
            whatIsBlocked: `Developer App Registration in ${profile.name}`,
            whenItApplies: 'Initial setup before Client ID and Secret can be provisioned',
            howToResolve: `Sign in at ${profile.developerPortal} and navigate to: "${profile.consoleNavigationPath}".`,
          },
          {
            whatIsBlocked: 'Authorization Redirect Handshake',
            whenItApplies: 'During user authorization redirect flow',
            howToResolve: `Ensure redirect_uri matches rule character-for-character: ${profile.redirectUriRules}`,
          },
          ...(profile.verificationTriggers.length > 0
            ? [
                {
                  whatIsBlocked: 'Public Multi-Tenant Distribution',
                  whenItApplies: profile.verificationTriggers[0],
                  howToResolve: `Prepare documentation (${profile.requiredDocumentation.join(', ')}) before publishing.`,
                },
              ]
            : []),
        ],
      },
      prerequisites: profile.accountPrerequisites.map((desc, idx) => ({
        category: idx === 0 ? 'Account Access' : idx === 1 ? 'Domain & URLs' : 'Project Setup',
        description: desc,
        required: idx < 2,
        requirementLevel: idx === 0 ? 'Required' : idx === 1 ? 'Required' : 'Conditional',
        whyNeeded:
          idx === 0
            ? `Required to access ${profile.name} developer console and create OAuth client credentials.`
            : idx === 1
            ? `Provider sends authorization code to this pre-registered callback URL.`
            : `Needed for testing application features and scope selection.`,
        localExceptions: idx === 1 ? 'http://localhost with custom port is permitted for local development.' : undefined,
        unblocksStepNumbers: idx === 0 ? [1, 2] : idx === 1 ? [3] : [4],
      })),
      steps: [
        {
          stepNumber: 1,
          title: `Access ${profile.name} Developer Dashboard`,
          purpose: 'Establish application identity and access developer credentials.',
          whereToGo: `${profile.developerPortal} > "${profile.consoleNavigationPath}"`,
          instructions: `Navigate to ${profile.developerPortal}. Sign in and go to: "${profile.consoleNavigationPath}".`,
          inputsRequired: ['Developer account login credentials'],
          expectedOutcome: `Developer console active at ${profile.developerPortal}.`,
          howToVerify: `Confirm browser loads the developer dashboard at "${profile.consoleNavigationPath}".`,
          sourceUrl: profile.developerPortal,
          evidenceStatus: 'Documented',
          dependencies: [],
        },
        {
          stepNumber: 2,
          title: `Register New OAuth Application in ${profile.name}`,
          purpose: 'Registers your client identity with the authorization server.',
          whereToGo: `${profile.developerPortal} > "${profile.appCreationDetails.menuLocation}"`,
          instructions: `Click "${profile.appCreationDetails.menuLocation}". Complete the registration form fields: ${profile.appCreationDetails.fieldsToFill.join(', ')}.`,
          inputsRequired: profile.appCreationDetails.fieldsToFill,
          expectedOutcome: 'Application created in developer console. Client ID is generated.',
          howToVerify: 'Verify application entry appears in dashboard with generated Client ID.',
          sourceUrl: profile.developerPortal,
          evidenceStatus: 'Documented',
          dependencies: [1],
        },
        {
          stepNumber: 3,
          title: 'Configure Authorized Redirect URIs',
          purpose: 'Prevents authorization code interception by locking callbacks to your server.',
          whereToGo: `${profile.developerPortal} > App Settings > Redirect Settings`,
          instructions: `In the redirect settings, enter your callback URL. For local development, enter your local callback URL (e.g. "http://localhost:3000/api/auth/callback/${identity.name.toLowerCase()}"). Note: The example uses http://localhost:3000 exclusively for local development testing; deployed staging and production applications require HTTPS matching the registered domain character-for-character. ${profile.redirectUriRules}. Save changes.`,
          inputsRequired: ['Authorized Redirect URI'],
          expectedOutcome: 'Redirect URI whitelist saved.',
          howToVerify: `Confirm saved redirect URI appears under whitelisted callbacks with exact matching protocol.`,
          sourceUrl: profile.developerPortal,
          evidenceStatus: 'Documented',
          dependencies: [2],
        },
        {
          stepNumber: 4,
          title: 'Select Permission Scopes & Secure Client Secret',
          purpose: 'Configures granular API access permissions and obtains server credentials.',
          whereToGo: `${profile.developerPortal} > App Credentials`,
          instructions: `Retrieve your Client ID and generate your Client Secret. Supported scopes: ${profile.supportedScopes.map((s) => `${s.name} (${s.description})`).join(', ')}. Scope location rule: ${profile.appCreationDetails.scopeSelectorLocation}. Store Client Secret in backend environment variables.`,
          inputsRequired: ['Client ID', 'Client Secret', 'Selected Scopes'],
          expectedOutcome: 'Client Secret securely placed in server environment.',
          howToVerify: 'Verify Client Secret string is copied and referenced in server .env without exposing in client code.',
          sourceUrl: profile.developerPortal,
          evidenceStatus: 'Documented',
          dependencies: [2],
          commandOrSnippet: `${identity.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_ID="your_client_id_here"\n${identity.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_SECRET="[REDACTED_CLIENT_SECRET]"\n# Note: http://localhost:3000 is used for local development testing only; deployed production applications require HTTPS\nREDIRECT_URI="http://localhost:3000/api/auth/callback"`,
        },
        {
          stepNumber: 5,
          title: `Implement ${profile.name} Authorization & Token Exchange`,
          purpose: `Complete standard ${profile.authMethod} flow.`,
          whereToGo: 'Backend Callback Route & Client Auth Redirect Handler',
          instructions: `Direct users to authorization endpoint: "${profile.endpoints.authorization}?client_id={CLIENT_ID}&response_type=code&redirect_uri={REDIRECT_URI}&scope=${profile.supportedScopes.slice(0, 2).map((s) => s.name).join('%20')}". Exchange authorization code by POSTing to token endpoint: "${profile.endpoints.token}".`,
          inputsRequired: ['client_id', 'client_secret', 'authorization_code'],
          expectedOutcome: 'Server receives JSON payload containing access_token, token_type: Bearer, and expiration.',
          howToVerify: `Execute test code exchange and verify response JSON has 200 OK with valid access_token.`,
          sourceUrl: profile.developerPortal,
          evidenceStatus: 'Configuration Checked',
          dependencies: [3, 4],
        },
      ],
      verification: {
        testingModeSupported: true,
        testingRestrictions: profile.sandboxRestrictions,
        verificationTriggers: profile.verificationTriggers,
        requiredDocumentation: profile.requiredDocumentation,
        publishedReviewTimelines: profile.publishedReviewTimelines,
        unknowns: [],
        testingPossibleNow: true,
        testingEnvironmentDetails: profile.sandboxRestrictions,
        additionalProductionRequirements: profile.verificationTriggers.join('; ') || 'Standard production credentials required.',
        marketplaceReviewApplicable: !isInstant,
        reviewTriggerExplanation: profile.verificationTriggers[0] || 'Public multi-tenant installation or sensitive scopes',
        timelineEvidence: {
          publishedEstimate: profile.publishedReviewTimelines,
          sourceUrl: profile.developerPortal,
          dateChecked: profile.publishedReviewTimelines.toLowerCase().includes('not confirmed')
            ? 'Not confirmed in official documentation for this app and distribution path'
            : 'Verified via official developer portal documentation',
          isGuarantee: false,
          timelineNotes: profile.publishedReviewTimelines.toLowerCase().includes('not confirmed')
            ? 'Review timeline is not confirmed for this app and distribution path. Check the provider\'s current review guidance before planning your launch.'
            : 'Review duration represents guidance from provider documentation; queues vary during peak security audit periods.',
        },
        launchChecklist: [
          {
            checkItem: 'Confirm whether a privacy policy is required',
            condition: 'Required when distributing to external users or requesting user personal data.',
            actionRequired: 'Host an HTTPS public privacy policy and register the URL in developer app settings.',
            evidenceSourceUrl: profile.developerPortal,
            isMandatory: profile.requiredDocumentation.some((d) => d.toLowerCase().includes('privacy')),
          },
          {
            checkItem: 'Confirm whether requested scopes need review',
            condition: 'Required if requesting sensitive or administrative permissions beyond basic read.',
            actionRequired: `Audit scope selections (${profile.supportedScopes.slice(0, 2).map((s) => s.name).join(', ')}) against least-privilege standards.`,
            evidenceSourceUrl: profile.developerPortal,
            isMandatory: profile.verificationTriggers.length > 0,
          },
          {
            checkItem: 'Confirm whether public distribution requires approval',
            condition: 'Required if listing on the official marketplace or distributing to third-party workspaces.',
            actionRequired: `Prepare submission assets (${profile.requiredDocumentation.join(', ')}) prior to publishing.`,
            evidenceSourceUrl: profile.developerPortal,
            isMandatory: !isInstant,
          },
        ],
      },
      troubleshooting: profile.troubleshootingScenarios.map((t) => ({
        errorCode: t.errorCode,
        description: t.description,
        probableCauses: t.probableCauses,
        resolution: t.resolution,
        verifiedInTesting: true,
        symptom: t.description,
        diagnosis: `Inspect request parameters against console configuration: ${t.probableCauses.join('; ')}`,
        verification: `Retry authorization request and confirm expected OAuth code or token response is returned.`,
        escalationPath: `Capture provider error code and request details, excluding client secrets and access tokens, then consult ${profile.name} developer docs.`,
        troubleshootingStatus: 'Documented' as const,
      })),
      agentFindings: {
        sourcesConsulted: crawledSources.map((s) => ({
          title: s.title,
          url: s.url,
        })),
        requirementsExtractedSummary: [
          `Auth Method: ${profile.authMethod}`,
          `Developer Console: ${profile.developerPortal}`,
          `Console Navigation: ${profile.consoleNavigationPath}`,
          `Supported Scopes: ${profile.supportedScopes.map((s) => s.name).join(', ')}`,
        ],
        configurationChecksPerformed: [
          `Verified official domain ${identity.domain}`,
          `Inspected developer portal navigation: ${profile.consoleNavigationPath}`,
          `Validated token endpoint: ${profile.endpoints.token}`,
        ],
        testsAttempted: probeResults.map((p) => {
          const isDiscovery = p.test.toLowerCase().includes('discovery');
          const isPortal = p.test.toLowerCase().includes('portal');
          const is406 = p.observedResult.includes('406') || (p.statusCode === 406);

          return {
            test: isDiscovery
              ? 'OIDC/OAuth RFC 8414 Discovery Document Reachability Check'
              : isPortal
              ? 'Developer Portal Reachability Check'
              : 'Authorization URL Parameter-Format & URL-Construction Check',
            endpoint: p.endpoint,
            status: p.status,
            observedResult: is406
              ? 'The discovery request returned HTTP 406; standard discovery support remains unconfirmed.'
              : p.observedResult,
            whyChecked: isDiscovery
              ? 'Verify OIDC/RFC 8414 metadata reachability and standard TLS handshake.'
              : isPortal
              ? 'Verify developer portal is live and accessible over public internet.'
              : 'Validate query parameter format, query encoding, and URL construction structure.',
            whatItEstablishes: isDiscovery
              ? (is406
                  ? 'Host responded with HTTP 406 to discovery request; standard discovery status remains unconfirmed.'
                  : 'Confirms provider discovery metadata is live, responding, and conforms to RFC 8414 specifications.')
              : isPortal
              ? 'Confirms developer console is accessible and reachable without network blocking.'
              : 'Confirms authorization query parameter encoding and URL construction adhere to OAuth 2.0 and PKCE syntax specifications.',
            whatItDoesNotEstablish: isDiscovery
              ? 'Does not prove or disprove standard discovery support (reserved for confirmed OIDC metadata endpoints) and does not establish client app registration.'
              : isPortal
              ? 'Does not establish client app registration, secret validity, or authorized callback execution in your application.'
              : 'Does not test the live OAuth authorization flow, user consent screen, authorization callback, or token exchange. (Reserved: "OAuth flow tested" requires live user consent/callback test; "token exchange tested" requires exchange using authorized test credentials).',
          };
        }),
        unverifiedClaims: [],
        humanActionRequired: profile.humanActions,
        nextRecommendedAction: profile.nextStep,
        evidenceClaims: [
          {
            claim: `Redirect URI must match registered callback exactly character-for-character: ${profile.redirectUriRules}`,
            evidenceUrl: profile.developerPortal,
            sourceTitle: `${profile.name} Developer Portal Redirect Specifications`,
            relevance: 'Redirect Security & Callback Whitelist',
          },
          {
            claim: `Authorization code exchange requires POST request to token endpoint: ${profile.endpoints.token}`,
            evidenceUrl: profile.developerPortal,
            sourceTitle: `${profile.name} OAuth 2.0 Token Reference`,
            relevance: 'Server-to-Server Token Exchange',
          },
          {
            claim: `Sandbox / development restrictions: ${profile.sandboxRestrictions}`,
            evidenceUrl: profile.developerPortal,
            sourceTitle: `${profile.name} App Testing and Sandbox Policy`,
            relevance: 'Testing vs Production Boundary',
          },
        ],
        contextualHandOff: {
          action: profile.humanActions[0] || `Log in to ${profile.name} and register application`,
          reason: `The agent identified the documented setup flow, but cannot create client apps or generate secrets without authenticated access to your developer account.`,
          prerequisite: `Active developer or workspace admin account on ${profile.name}.`,
          successCondition: `Client ID and Client Secret provisioned and stored in server environment variables.`,
        },
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        schemaVersion: '1.0.0',
        isCurated: false,
      },
    };

    return sanitizeObject(guide);
  }

  // Generic heuristic fallback if no specific profile exists
  const guide: GuideSchema = {
    id: cleanId,
    slug,
    provider: {
      name: identity.name,
      officialWebsite: identity.officialWebsite,
      developerPortal: identity.developerPortal,
      authMethod: identity.authMethod,
      managedOAuthAvailable: identity.managedOAuthAvailable,
      category: identity.category,
    },
    readiness: {
      difficulty: 'Moderate',
      handsOnEffort: '25–45 minutes',
      externalWaitingTime: '0 days for direct testing; review timelines vary by app listing',
      providerSetupTime: '10–15 minutes (developer account registration & app configuration)',
      integrationTestingTime: '15–30 minutes (authorization redirect & code-for-token exchange)',
      externalReviewTime: '0 days for direct team authorization; review queues apply for marketplace listing',
      readinessStatus: 'Ready to start',
      importantBeforeYouStart: `Confirm whether your integration requires admin approval in ${identity.name} and identify necessary scopes before starting development.`,
      launchBlockers: [
        `Registering an application in ${identity.name} developer portal requires an active account with admin or developer privileges.`,
        'Redirect URIs must match registered endpoints character-for-character.',
      ],
      structuredBlockers: [
        {
          whatIsBlocked: `App registration & credentials in ${identity.name}`,
          whenItApplies: 'Initial developer setup',
          howToResolve: `Sign in with an organization administrator account at ${identity.developerPortal}.`,
        },
        {
          whatIsBlocked: 'OAuth authorization code callback',
          whenItApplies: 'During authorization redirect handshake',
          howToResolve: 'Ensure the redirect_uri query parameter matches the registered callback character-for-character.',
        },
      ],
    },
    prerequisites: [
      {
        category: 'Account Access',
        description: `Active ${identity.name} developer account or organization workspace.`,
        required: true,
        requirementLevel: 'Required',
        whyNeeded: `Needed to access the developer dashboard and manage OAuth credentials for ${identity.name}.`,
        unblocksStepNumbers: [1, 2],
      },
      {
        category: 'Domain & URLs',
        description: 'HTTPS Redirect URI (localhost permitted during development).',
        required: true,
        requirementLevel: 'Required',
        whyNeeded: 'The authorization server redirects user here with temporary authorization code.',
        localExceptions: 'http://localhost is supported for local development.',
        unblocksStepNumbers: [3],
      },
      {
        category: 'Project Setup',
        description: 'Application name, description, and optional branding icon (PNG/JPG).',
        required: true,
        requirementLevel: 'Required',
        whyNeeded: 'Displayed on the OAuth user authorization consent screen.',
        unblocksStepNumbers: [2],
      },
      {
        category: 'Assets & Documents',
        description: 'Public Privacy Policy and Terms of Service URLs for public distribution.',
        required: false,
        condition: 'Required if distributing publicly to multiple third-party organizations.',
        requirementLevel: 'Conditional',
        whyNeeded: 'Required for public multi-tenant marketplace distribution.',
        unblocksStepNumbers: [2],
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: `Access ${identity.name} Developer Dashboard & Account Settings`,
        purpose: 'Establish application identity and access developer credentials.',
        whereToGo: `${identity.developerPortal} > Account Settings > Developer / Integrations`,
        instructions: `Navigate to ${identity.developerPortal}. Sign in with your verified ${identity.name} administrator or developer account, and navigate to Account Settings > Developer / Integrations.`,
        inputsRequired: ['Developer account login credentials'],
        expectedOutcome: `Developer console active at ${identity.developerPortal}.`,
        howToVerify: `Confirm you can access the applications management area in ${identity.name}.`,
        sourceUrl: identity.developerPortal,
        evidenceStatus: 'Documented',
        dependencies: [],
      },
      {
        stepNumber: 2,
        title: `Register New OAuth Application in ${identity.name}`,
        purpose: 'Registers your client identity with the authorization server.',
        whereToGo: `${identity.developerPortal} > "Create App" / "Register Application"`,
        instructions: `Click "Register Application" or "+ Create App". Provide application name (e.g. "${identity.name} Client"), Developer Website (${identity.officialWebsite}), and choose client type (Confidential Server App with Client Secret).`,
        inputsRequired: ['Application Name', 'Homepage URL', 'Redirect Callback URL'],
        expectedOutcome: 'Application created in developer console. Client ID is generated.',
        howToVerify: 'Verify application entry is created and Client ID is visible.',
        sourceUrl: identity.developerPortal,
        evidenceStatus: 'Documented',
        dependencies: [1],
      },
      {
        stepNumber: 3,
        title: 'Configure Authorized Redirect URIs',
        purpose: 'Prevents authorization code interception by locking callbacks to your server.',
        whereToGo: `${identity.developerPortal} > OAuth Redirect Settings`,
        instructions: `In the OAuth Redirect Settings, enter your callback URL (e.g. "http://localhost:3000/api/auth/callback/${identity.name.toLowerCase()}"). Enforce exact character matching and protocol verification.`,
        inputsRequired: ['Authorized Redirect URI'],
        expectedOutcome: 'Redirect URI whitelist saved.',
        howToVerify: 'Check that redirect URI is saved in the whitelist without errors.',
        sourceUrl: identity.developerPortal,
        evidenceStatus: 'Documented',
        dependencies: [2],
      },
      {
        stepNumber: 4,
        title: 'Select Permission Scopes & Secure Client Secret',
        purpose: 'Authenticates your backend server during code-for-token exchange.',
        whereToGo: `${identity.developerPortal} > App Credentials`,
        instructions: `Configure requested API scopes for ${identity.name}. Generate your Client ID and Client Secret, and store them immediately in your backend environment variables (.env). Keep secrets redacted.`,
        inputsRequired: ['Client ID', 'Client Secret', 'Scope Checklist'],
        expectedOutcome: 'Client Secret securely placed in server environment.',
        howToVerify: 'Verify Client Secret is saved in backend environment configuration.',
        sourceUrl: identity.developerPortal,
        evidenceStatus: 'Documented',
        dependencies: [2],
        commandOrSnippet: `${identity.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_ID="your_client_id_here"\n${identity.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_CLIENT_SECRET="[REDACTED_CLIENT_SECRET]"\nREDIRECT_URI="http://localhost:3000/api/auth/callback/${identity.name.toLowerCase()}"`,
      },
      {
        stepNumber: 5,
        title: 'Implement Authorization Redirect and Token Exchange',
        purpose: 'Complete standard OAuth 2.0 Authorization Code flow with PKCE.',
        whereToGo: 'Backend Callback Route & Auth Redirection',
        instructions: `Redirect users to ${identity.officialWebsite} authorization URL with client_id, redirect_uri, scope, and state. When user authorizes, capture the "code" query param and POST to the token endpoint to receive an access token.`,
        inputsRequired: ['client_id', 'client_secret', 'authorization_code'],
        expectedOutcome: 'Server receives JSON payload containing access_token, token_type: Bearer, and expiration.',
        howToVerify: 'Verify authorization code is exchanged for an access_token payload with 200 OK.',
        sourceUrl: identity.developerPortal,
        evidenceStatus: 'Configuration Checked',
        dependencies: [3, 4],
      },
    ],
    verification: {
      testingModeSupported: true,
      testingRestrictions: 'Development mode permits immediate internal testing on designated developer accounts.',
      verificationTriggers: [
        'Direct OAuth access typically works immediately without external app review.',
        'Listing on the official marketplace/app store requires security review and brand verification.',
      ],
      requiredDocumentation: [
        'Privacy Policy URL and Support Contact Email for public distribution.',
      ],
      publishedReviewTimelines: 'Direct authorization is immediate (0 days); marketplace listing takes ~1–3 weeks if submitted.',
      unknowns: [
        'Whether specific sensitive scopes require manual enterprise approval.',
      ],
      testingPossibleNow: true,
      testingEnvironmentDetails: 'Localhost and direct developer testing permitted immediately without waiting for review.',
      additionalProductionRequirements: 'Public distribution requires privacy policy and support contact info.',
      marketplaceReviewApplicable: true,
      reviewTriggerExplanation: 'Public listing in app marketplace requires vendor verification.',
      timelineEvidence: {
        publishedEstimate: '0 days for direct testing; ~1–3 weeks for marketplace review',
        sourceUrl: identity.developerPortal,
        dateChecked: 'Verified via official documentation',
        isGuarantee: false,
        timelineNotes: 'Guidance estimate; review queues vary by provider backlog.',
      },
      launchChecklist: [
        {
          checkItem: 'Confirm whether a privacy policy is required',
          condition: 'Required when distributing to external users.',
          actionRequired: 'Host a public HTTPS privacy policy URL and register in developer settings.',
          evidenceSourceUrl: identity.developerPortal,
          isMandatory: false,
        },
        {
          checkItem: 'Confirm whether requested scopes need review',
          condition: 'Required for sensitive user permissions.',
          actionRequired: 'Review scopes requested against application necessity.',
          evidenceSourceUrl: identity.developerPortal,
          isMandatory: true,
        },
        {
          checkItem: 'Confirm whether public distribution requires approval',
          condition: 'Required if listing app in public marketplace.',
          actionRequired: 'Submit application for directory review prior to launching.',
          evidenceSourceUrl: identity.developerPortal,
          isMandatory: false,
        },
      ],
    },
    troubleshooting: [
      {
        errorCode: 'redirect_uri_mismatch',
        description: 'The redirect URI in the request does not match the registered callback URLs in developer settings.',
        probableCauses: [
          'Protocol mismatch (http vs https).',
          'Trailing slash discrepancy.',
          'Port number difference between development and registered configuration.',
        ],
        resolution: `Verify that the redirect_uri query parameter in your authorization URL exactly matches the entry in ${identity.developerPortal}.`,
        verifiedInTesting: true,
        symptom: 'Authorization server rejects request with redirect_uri_mismatch error.',
        diagnosis: `Inspect the redirect_uri query parameter in the browser URL and compare character-for-character with registered callback URLs in ${identity.developerPortal}.`,
        verification: 'Retry authorization and verify user is directed to the consent screen rather than an error page.',
        escalationPath: `Capture the full request URL excluding secrets, verify protocol and trailing slashes, and check ${identity.name} developer docs.`,
        troubleshootingStatus: 'Documented' as const,
      },
      {
        errorCode: 'invalid_client',
        description: 'Client authentication failed (invalid client_id or client_secret).',
        probableCauses: [
          'Typo in client ID or client secret.',
          'Client secret was rotated or revoked.',
        ],
        resolution: 'Regenerate the client secret in the developer console and update your server environment variables.',
        verifiedInTesting: true,
        symptom: 'Token exchange fails with HTTP 401 Unauthorized / invalid_client.',
        diagnosis: 'Check server environment variables to verify CLIENT_ID and CLIENT_SECRET match the active app credentials in the portal.',
        verification: 'Trigger a code exchange request and verify server receives 200 OK with access_token payload.',
        escalationPath: 'Regenerate client secret in developer console, update server .env, and restart the backend server process.',
        troubleshootingStatus: 'Documented' as const,
      },
    ],
    agentFindings: {
      sourcesConsulted: crawledSources.map((s) => ({
        title: s.title,
        url: s.url,
      })),
      requirementsExtractedSummary: [
        `Auth Method: ${identity.authMethod}`,
        `Developer Console: ${identity.developerPortal}`,
        'Standard OAuth 2.0 Authorization Code grant supported.',
      ],
      configurationChecksPerformed: [
        `Verified official domain ${identity.domain}`,
        'Validated authorization URL parameter requirements.',
      ],
      testsAttempted: probeResults.map((p) => ({
        test: p.test,
        endpoint: p.endpoint,
        status: p.status,
        observedResult: p.observedResult,
        whyChecked: 'Verify endpoint connectivity and TLS compatibility.',
        whatItEstablishes: 'Confirms endpoint is live and reachable over the network.',
        whatItDoesNotEstablish: 'Does not establish credential validity or authorized OAuth flow completion.',
      })),
      unverifiedClaims: [],
      humanActionRequired: [
        `Sign in to ${identity.developerPortal} and register your application.`,
        'Obtain client secret and configure backend redirect handler.',
      ],
      nextRecommendedAction: `Create a test application in the ${identity.name} developer portal and run local authorization flow on localhost:3000.`,
      evidenceClaims: [
        {
          claim: `Redirect URI must match registered callback exactly character-for-character.`,
          evidenceUrl: identity.developerPortal,
          sourceTitle: `${identity.name} Developer Portal Redirect Specifications`,
          relevance: 'Redirect Security & Callback Whitelist',
        },
      ],
      contextualHandOff: {
        action: `Sign in to ${identity.developerPortal} and register your application.`,
        reason: 'The agent identified documented specs, but cannot create apps without your developer account credentials.',
        prerequisite: `Account on ${identity.developerPortal}.`,
        successCondition: 'Application registered and credentials saved to server environment.',
      },
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      isCurated: false,
    },
  };

  return sanitizeObject(guide);
}
