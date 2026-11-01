import type { MetadataRoute } from 'next';
import { DEFAULT_LANG } from '@/lib/i18n';
import { getSite, siteBase } from '@/lib/store';

export const dynamic = 'force-dynamic';
export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteBase((await getSite(DEFAULT_LANG)).settings);
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/*/cart', '/*/search'] }], sitemap: `${base}/sitemap.xml` };
}
