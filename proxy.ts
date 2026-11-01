import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { DEFAULT_LANG, LANG_CODES } from '@/lib/i18n';

/** Content-Security-Policy with a fresh random nonce per request: only scripts that carry the nonce (the ones Next.js itself emits) can run. No 'unsafe-inline' for scripts. */
function csp(nonce: string) {
  const supa = process.env.NEXT_PUBLIC_SUPABASE_URL || '', dev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",           // only style="" attributes (image tones); no external styles
    "font-src 'self'", `img-src 'self' data: blob: ${supa}`.trim(), `connect-src 'self' ${supa} ${supa.replace('https://', 'wss://')}`.trim(),
    "frame-ancestors 'none'", "form-action 'self'", "base-uri 'self'", "object-src 'none'", ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

// Next.js 16 "proxy" (formerly middleware): CSP nonce for every page, language redirect for "/", and the /admin session gate.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/') {
    const cookie = req.cookies.get('yb_lang')?.value;
    const accept = (req.headers.get('accept-language') || '').split(',').map((x) => x.trim().slice(0, 2).toLowerCase());
    const pick = (cookie && LANG_CODES.includes(cookie) && cookie) || accept.find((c) => LANG_CODES.includes(c)) || DEFAULT_LANG;
    return NextResponse.redirect(new URL(`/${pick}`, req.url));
  }
  const nonce = btoa(crypto.randomUUID()), policy = csp(nonce);
  const headers = new Headers(req.headers); headers.set('x-nonce', nonce); headers.set('content-security-policy', policy);   // Next.js reads the nonce from the request header
  const next = () => { const r = NextResponse.next({ request: { headers } }); r.headers.set('Content-Security-Policy', policy); return r; };
  if (pathname.startsWith('/admin')) {
    let res = next();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return pathname === '/admin/login' ? res : NextResponse.redirect(new URL('/admin/login', req.url));
    const sb = createServerClient(url, key, { cookies: { getAll: () => req.cookies.getAll(), setAll: (list) => { list.forEach(({ name, value }) => req.cookies.set(name, value)); res = next(); list.forEach(({ name, value, options }) => res.cookies.set(name, value, options)); } } });
    const { data: { user } } = await sb.auth.getUser();   // verified with Supabase Auth, refreshes tokens
    if (!user && pathname !== '/admin/login') return NextResponse.redirect(new URL('/admin/login', req.url));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
  return next();
}
export const config = { matcher: ['/', '/((?!_next/static|_next/image|img/|favicon.ico|.*\\.(?:jpg|jpeg|png|webp|gif|svg|ico|woff2|txt|xml)$).*)'] };
