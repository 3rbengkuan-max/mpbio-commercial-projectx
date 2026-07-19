import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * The only routes reachable signed out. Everything else — including the
 * dashboard and feed — requires a session, matching the `to authenticated`
 * read policies in 0002. An allowlist rather than a blocklist, so a new page
 * is private by default.
 */
const PUBLIC_ROUTES = ["/login", "/signup", "/auth", "/api/health"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured, skip the auth refresh and pass through.
  // Without this guard createServerClient throws "Your project's URL and Key
  // are required", crashing the edge middleware on every route (500
  // MIDDLEWARE_INVOCATION_FAILED).
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  try {
    let response = supabaseResponse;
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Refresh session so it doesn't expire while user is active
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Reads are gated as of Sprint 4: this workspace holds competitor intel and
    // named accounts. RLS is the real boundary; this redirect just sends a
    // signed-out visitor to a login page instead of an empty-looking app.
    if (!user && !isPublicRoute(request.nextUrl.pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set(
        "next",
        request.nextUrl.pathname + request.nextUrl.search,
      );
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // Never let an auth hiccup crash the entire edge middleware
    return supabaseResponse;
  }
}
