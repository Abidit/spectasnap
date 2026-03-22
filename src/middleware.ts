import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/frames',
  '/upload',
  '/qr',
  '/onepager',
  '/onboarding',
  '/settings',
];

// Routes that are always public — no auth redirect
const PUBLIC_ROUTES = ['/', '/trydemo', '/pricing', '/embed'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // ── Demo mode: no Supabase env vars configured ─────────────────────────────
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return supabaseResponse;
  }

  // ── Create Supabase server client ──────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session (IMPORTANT: do not remove — required for Supabase SSR)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Admin route protection ─────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);
    if (!user || !adminEmails.includes(user.email ?? '')) {
      return new NextResponse(null, { status: 404 });
    }
    return supabaseResponse;
  }

  // ── Protected route check ──────────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = pathname.startsWith('/auth');

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon, robots, sitemap, og-image
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon|robots|sitemap|og-image|api/).*)',
  ],
};
