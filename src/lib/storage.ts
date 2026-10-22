import { GuideSchema } from '@/types/guide';
import { seedGuides } from '@/data/seedGuides';
import fs from 'fs';
import path from 'path';

// In-memory cache map
const guideCache = new Map<string, GuideSchema>();

// Seed with default benchmark guides
for (const guide of seedGuides) {
  guideCache.set(guide.slug, guide);
  guideCache.set(guide.id, guide);
}

/**
 * Saves a generated guide into the dynamic store and file system if available
 */
export async function saveGeneratedGuide(guide: GuideSchema): Promise<void> {
  guideCache.set(guide.slug, guide);
  guideCache.set(guide.id, guide);

  try {
    const dataDir = path.join(process.cwd(), 'data', 'generated');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, `${guide.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(guide, null, 2), 'utf-8');
  } catch (err) {
    // Non-blocking in serverless/read-only environments
    console.warn('Could not write guide to disk cache:', err);
  }
}

/**
 * Retrieves a guide by slug or ID
 */
export async function getGuideBySlugOrId(slugOrId: string): Promise<GuideSchema | null> {
  const cached = guideCache.get(slugOrId);
  if (cached) return cached;

  try {
    const dataDir = path.join(process.cwd(), 'data', 'generated');
    const filePath = path.join(dataDir, `${slugOrId}.json`);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content) as GuideSchema;
      guideCache.set(parsed.slug, parsed);
      guideCache.set(parsed.id, parsed);
      return parsed;
    }
  } catch {
    // Ignore read errors
  }

  return null;
}

/**
 * Lists all available guides (curated + generated)
 */
export async function getAllGuides(): Promise<GuideSchema[]> {
  const unique = new Map<string, GuideSchema>();
  for (const guide of guideCache.values()) {
    unique.set(guide.id, guide);
  }

  // Also read any persisted JSON guides from data/generated/
  try {
    const dataDir = path.join(process.cwd(), 'data', 'generated');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(dataDir, file), 'utf-8');
          const parsed = JSON.parse(content) as GuideSchema;
          if (parsed && parsed.id) {
            unique.set(parsed.id, parsed);
            guideCache.set(parsed.slug, parsed);
            guideCache.set(parsed.id, parsed);
          }
        } catch {
          // ignore corrupted files
        }
      }
    }
  } catch {
    // ignore filesystem access errors
  }

  return Array.from(unique.values());
}

