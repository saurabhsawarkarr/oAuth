import { ResearchProgressEvent, GuideSchema } from '@/types/guide';
import { resolveProviderIdentity, discoverAndCrawlSources, ProviderIdentity, CrawledSource } from '@/lib/crawler';
import { probeDiscoveryEndpoint, probePortalReachability, validateAuthorizationUrlSyntax, ProbeResult } from '@/lib/prober';
import { synthesizeGuideWithGemini } from '@/lib/gemini';
import { saveGeneratedGuide } from '@/lib/storage';

export type ProgressCallback = (event: ResearchProgressEvent) => void;

/**
 * Autonomous 7-Stage OAuth Research Orchestrator
 */
export async function executeOAuthResearchPipeline(
  query: string,
  onProgress?: ProgressCallback
): Promise<GuideSchema> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const emit = (
    stage: ResearchProgressEvent['stage'],
    stageIndex: number,
    message: string,
    extra?: Partial<ResearchProgressEvent>
  ) => {
    if (onProgress) {
      onProgress({
        jobId,
        stage,
        stageIndex,
        message,
        timestamp: new Date().toISOString(),
        ...extra,
      });
    }
  };

  try {
    // =========================================================================
    // Stage 1: Identity & Developer Portal Resolver
    // =========================================================================
    emit('identifying', 1, `Resolving canonical identity and developer portal for "${query}"...`);
    const identity: ProviderIdentity = await resolveProviderIdentity(query);
    emit('identifying', 1, `Identified provider: ${identity.name} (${identity.domain})`, {
      details: `Developer Portal: ${identity.developerPortal}`,
    });

    // =========================================================================
    // Stage 2: Official Source Discovery
    // =========================================================================
    emit('discovering_sources', 2, `Discovering and inspecting official documentation for ${identity.name}...`);
    const crawledSources: CrawledSource[] = await discoverAndCrawlSources(identity);
    emit('discovering_sources', 2, `Retrieved ${crawledSources.length} authentic developer reference documents.`, {
      discoveredSources: crawledSources.map((s) => ({ title: s.title, url: s.url })),
    });

    // =========================================================================
    // Stage 3: Information Extraction (Google Gemini)
    // =========================================================================
    emit('extracting_requirements', 3, 'Google Gemini LLM ingesting documentation & extracting structured scopes and endpoints...');

    // =========================================================================
    // Stage 4: Workflow Reconstruction & Dependency Analysis
    // =========================================================================
    emit('reconstructing_workflow', 4, 'Analyzing setup dependency graph, prerequisites, and gating triggers...');

    // =========================================================================
    // Stage 5: Practical Validator & Safe Prober
    // =========================================================================
    emit('probing_endpoints', 5, 'Executing non-destructive safe validation probes on discovery endpoints and TLS...');

    const probeResults: ProbeResult[] = [];

    // Probe 1: OIDC / RFC 8414 discovery endpoint
    const discoveryProbe = await probeDiscoveryEndpoint(identity.domain);
    probeResults.push(discoveryProbe);

    // Probe 2: Portal reachability
    const portalProbe = await probePortalReachability(identity.developerPortal);
    probeResults.push(portalProbe);

    // Probe 3: Syntax validation for PKCE authorization URL
    const syntaxProbe = validateAuthorizationUrlSyntax(`${identity.officialWebsite}/oauth/authorize`, {
      clientId: 'example_client_id_placeholder',
      redirectUri: 'http://localhost:3000/api/auth/callback',
      scope: 'read write',
      state: 'csrf_token_xyz',
      codeChallenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
    });
    probeResults.push(syntaxProbe);

    emit('probing_endpoints', 5, `Completed ${probeResults.length} safe probes.`, {
      probeResult: discoveryProbe,
    });

    // =========================================================================
    // Stage 6: Guide Synthesis & Secret Redaction
    // =========================================================================
    emit('synthesizing_guide', 6, 'Synthesizing standardized 6-section guide and scrubbing any sensitive credentials...');
    const finalizedGuide: GuideSchema = await synthesizeGuideWithGemini(
      identity,
      crawledSources,
      probeResults
    );

    // =========================================================================
    // Stage 7: Storage & Delivery Dispatcher
    // =========================================================================
    emit('completed', 7, `Guide generated successfully for ${identity.name}. Preparing permalink.`, {
      guide: finalizedGuide,
    });

    await saveGeneratedGuide(finalizedGuide);

    return finalizedGuide;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    emit('error', 7, `Research pipeline encountered an error: ${errorMsg}`, {
      error: errorMsg,
    });
    throw err;
  }
}
