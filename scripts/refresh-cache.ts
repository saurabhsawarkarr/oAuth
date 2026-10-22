import { executeOAuthResearchPipeline } from '../src/lib/orchestrator';

const providers = ['Linear', 'Spotify', 'HubSpot', 'Figma', 'Asana', 'LinkedIn'];

async function refreshAll() {
  console.log('Refreshing all 6 generated guides with updated Section A, B, and C schema...');
  for (const name of providers) {
    console.log(`\nProcessing ${name}...`);
    try {
      const guide = await executeOAuthResearchPipeline(name, (evt) => {
        if (evt.stage === 'probing_endpoints' || evt.stage === 'synthesizing_guide') {
          console.log(`  [${evt.stage}]: ${evt.message}`);
        }
      });
      console.log(`✓ ${name} completed: slug=${guide.slug}, steps=${guide.steps.length}`);
    } catch (err) {
      console.error(`✗ Error processing ${name}:`, err);
    }
  }
  console.log('\nAll generated guides updated successfully!');
}

refreshAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
