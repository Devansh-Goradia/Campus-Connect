import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run middleware on static files or api routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register') || request.nextUrl.pathname.startsWith('/admin-login')
  
  if (user) {
    // If logged in, grab profile to check status and admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('verification_status, is_admin')
      .eq('id', user.id)
      .single()

    const status = profile?.verification_status || 'pending'
    const isAdmin = profile?.is_admin || false

    // Route logic
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } else if (isAdmin) {
      if (!request.nextUrl.pathname.startsWith('/admin')) {
         return NextResponse.redirect(new URL('/admin', request.url))
      }
    } else {
      // Normal user
      if (status === 'pending' && !request.nextUrl.pathname.startsWith('/waiting-room')) {
        return NextResponse.redirect(new URL('/waiting-room', request.url))
      }
      if (status === 'approved' && (request.nextUrl.pathname === '/' || isAuthRoute || request.nextUrl.pathname.startsWith('/waiting-room'))) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } else {
    // Not logged in
    if (!isAuthRoute && request.nextUrl.pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
