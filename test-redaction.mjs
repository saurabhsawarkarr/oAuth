import { sanitizeText, sanitizeObject } from './src/lib/sanitizer.ts';
import { seedGuides } from './src/data/seedGuides.ts';
import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('Automated Token & Secret Redaction Verification Test');
console.log('====================================================\n');

// 1. Synthetic Secret Injection Tests (constructed dynamically for testing)
const dummyGoogleSecret = ['GOCSPX', 'abc123def456ghi789jkl012mno345pqr'].join('-');
const dummyGithubToken = ['ghp', '1234567890abcdefghijklmnopqrstuvwxyzAB'].join('_');
const dummySlackToken = ['xoxb', '123456789012', '1234567890123', 'abcdefghijklmnopqrstuvwxyz'].join('-');
const dummyJwtToken = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9', 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0', 'signature_token_here'].join('.');
const dummyStripeKey = ['sk', 'live', '1234567890abcdefghijklmnop'].join('_');

const INJECTION_TESTS = [
  {
    name: 'Google OAuth Client Secret',
    input: `client_secret: "${dummyGoogleSecret}"`,
    mustNotContain: dummyGoogleSecret,
    mustContain: '[REDACTED_GOOGLE_CLIENT_SECRET]',
  },
  {
    name: 'GitHub Personal Access Token',
    input: `Authorization: token ${dummyGithubToken}`,
    mustNotContain: dummyGithubToken,
    mustContain: '[REDACTED_GITHUB_TOKEN]',
  },
  {
    name: 'Slack Bot Token',
    input: `SLACK_BOT_TOKEN="${dummySlackToken}"`,
    mustNotContain: dummySlackToken,
    mustContain: '[REDACTED_SLACK_TOKEN]',
  },
  {
    name: 'Generic JWT Bearer Token',
    input: `Authorization: Bearer ${dummyJwtToken}`,
    mustNotContain: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    mustContain: 'Bearer [REDACTED_JWT_TOKEN]',
  },
  {
    name: 'Stripe Secret Key',
    input: `STRIPE_KEY = "${dummyStripeKey}"`,
    mustNotContain: dummyStripeKey,
    mustContain: '[REDACTED_SECRET]',
  },
];

let passedInjections = 0;
for (const test of INJECTION_TESTS) {
  const sanitized = sanitizeText(test.input);
  if (sanitized.includes(test.mustNotContain)) {
    console.error(`❌ FAILED: ${test.name} leaked secret: "${test.mustNotContain}" in "${sanitized}"`);
    process.exit(1);
  }
  if (!sanitized.includes(test.mustContain)) {
    console.error(`❌ FAILED: ${test.name} missing expected mask "${test.mustContain}" in "${sanitized}"`);
    process.exit(1);
  }
  console.log(`✓ Passed: ${test.name} safely scrubbed.`);
  passedInjections++;
}

console.log(`\nAll ${passedInjections} injection tests passed.\n`);

// 2. Full Guide Payload Audit
console.log('Auditing all seed guides and generated guides for credential leaks...');

const LEAK_REGEXES = [
  /GOCSPX-[A-Za-z0-9_-]{28}/,
  /gh[pousr]_[A-Za-z0-9_]{36}/,
  /xox[baprs]-[0-9A-Za-z-]{24}/,
  /Bearer\s+eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+/,
  /sk_live_[A-Za-z0-9]{20,}/,
];

function inspectPayload(guide, sourceName) {
  const jsonString = JSON.stringify(guide);
  for (const regex of LEAK_REGEXES) {
    if (regex.test(jsonString)) {
      console.error(`❌ SECURITY LEAK DETECTED in ${sourceName}: matched pattern ${regex}`);
      process.exit(1);
    }
  }
  console.log(`✓ Verified Clean: ${sourceName} (${guide.provider.name})`);
}

// Audit Seed Guides
for (const guide of seedGuides) {
  inspectPayload(guide, `SeedGuide:${guide.id}`);
}

// Audit Generated Guides in data/generated/
const dataDir = path.join(process.cwd(), 'data', 'generated');
if (fs.existsSync(dataDir)) {
  const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(dataDir, file), 'utf-8');
    const parsed = JSON.parse(raw);
    inspectPayload(parsed, `GeneratedGuide:${file}`);
  }
}

console.log('\n====================================================');
console.log('✅ ALL REDACTION CHECKS PASSED: ZERO CREDENTIALS LEAKED');
console.log('====================================================');
