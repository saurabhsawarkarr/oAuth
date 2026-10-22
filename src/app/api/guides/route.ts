import { NextRequest, NextResponse } from 'next/server';
import { getAllGuides } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').toLowerCase().trim();

    const all = await getAllGuides();

    if (!search) {
      return NextResponse.json({ guides: all });
    }

    const filtered = all.filter(
      (g) =>
        g.provider.name.toLowerCase().includes(search) ||
        g.provider.category?.toLowerCase().includes(search) ||
        g.provider.authMethod.toLowerCase().includes(search)
    );

    return NextResponse.json({ guides: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
