import { Metadata } from 'next';
import { getGuideBySlugOrId } from '@/lib/storage';
import { GuideClientPage } from './GuideClientPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlugOrId(slug);

  if (!guide) {
    return {
      title: 'Guide Not Found | OAuth Setup Guide Agent',
      description: 'The requested OAuth integration guide could not be located.',
    };
  }

  return {
    title: `${guide.provider.name} OAuth 2.0 Setup Guide | OAuth Setup Guide Agent`,
    description: `Actionable, evidence-backed OAuth setup guide for ${guide.provider.name}. Setup difficulty: ${guide.readiness.difficulty}. Estimated hands-on effort: ${guide.readiness.handsOnEffort}.`,
    openGraph: {
      title: `${guide.provider.name} OAuth 2.0 Integration Guide`,
      description: `Complete 6-section setup roadmap for ${guide.provider.name}: credentials, redirect URLs, scopes, and verification requirements.`,
      type: 'article',
    },
  };
}

export default async function GuidePermalinkPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuideBySlugOrId(slug);

  return <GuideClientPage initialGuide={guide} slug={slug} />;
}
