import { executeOAuthResearchPipeline } from './src/lib/orchestrator.ts';

async function test() {
  console.log('Testing 7-Stage Autonomous Research Pipeline for "Linear"...');
  
  const guide = await executeOAuthResearchPipeline('Linear', (event) => {
    console.log(`[Stage ${event.stageIndex}/7 - ${event.stage}]: ${event.message}`);
  });

  console.log('\n--- Pipeline Succeeded! ---');
  console.log('Generated Guide ID:', guide.id);
  console.log('Provider Name:', guide.provider.name);
  console.log('Auth Method:', guide.provider.authMethod);
  console.log('Difficulty:', guide.readiness.difficulty);
  console.log('Number of Steps:', guide.steps.length);
  console.log('Troubleshooting Scenarios:', guide.troubleshooting.length);
  console.log('Sources Consulted:', guide.agentFindings.sourcesConsulted.length);
  console.log('Tests Attempted:', guide.agentFindings.testsAttempted.length);
  console.log('Next Recommended Action:', guide.agentFindings.nextRecommendedAction);
}

test().catch((err) => {
  console.error('Test pipeline failed:', err);
  process.exit(1);
});
