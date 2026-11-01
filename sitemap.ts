import type { MetadataRoute } from 'next';
import { LANG_CODES, PAGE_KEYS } from '@/lib/i18n';
import { getSite, getSitemapData, siteBase } from '@/lib/store';
import { DEFAULT_LANG } from '@/lib/i18n';

export const dynamic = 'force-dynamic';
/** Every public page in all six languages, each with its language alternates. Drafts, the cart, search and the admin are never listed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite(DEFAULT_LANG), base = siteBase(site.settings), d = await getSitemapData().catch(() => ({ categories: [] as string[], products: [] as { slug: string; updated: string }[] }));
  const paths: { p: string; at?: string }[] = [{ p: '' }, { p: '/contact' }, ...PAGE_KEYS.map((k) => ({ p: '/page/' + k })), ...d.categories.map((c) => ({ p: '/c/' + c })), ...d.products.map((x) => ({ p: '/p/' + x.slug, at: x.updated }))];
  return paths.flatMap(({ p, at }) => LANG_CODES.map((l) => ({ url: `${base}/${l}${p}`, lastModified: at ? new Date(at) : undefined, alternates: { languages: Object.fromEntries(LANG_CODES.map((a) => [a, `${base}/${a}${p}`])) } })));
}
