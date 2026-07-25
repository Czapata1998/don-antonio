import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Cookie de sesión del panel. La verificación fuerte (firma HMAC + expiración)
// la hace requireAdmin() en el layout del panel (runtime node); aquí solo se
// hace el ruteo por host y una redirección rápida si falta la cookie.
const COOKIE_SESION = 'da_admin'

// Rutas que NO se reescriben aunque venga por el subdominio admin.*
const ASSET = /^\/(_next|api|favicon|icon|apple-icon|logo|gallery|placeholder|.*\.(?:png|jpe?g|svg|ico|txt|xml|webmanifest|css|js))/

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0]
  const esSubdominioAdmin = host.startsWith('admin.')
  const { pathname } = req.nextUrl
  const tieneCookie = Boolean(req.cookies.get(COOKIE_SESION)?.value)

  // ── Subdominio admin.*  →  sirve el panel (/admin) de forma transparente ──
  if (esSubdominioAdmin) {
    if (pathname.startsWith('/admin') || ASSET.test(pathname)) {
      // ya apunta al panel o es un asset: solo proteger
      if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !tieneCookie) {
        const url = req.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }
    // reescribir "/", "/agenda"… → "/admin", "/admin/agenda"…
    const url = req.nextUrl.clone()
    url.pathname = `/admin${pathname === '/' ? '' : pathname}`
    if (url.pathname !== '/admin/login' && !tieneCookie) url.pathname = '/admin/login'
    return NextResponse.rewrite(url)
  }

  // ── Dominio normal  →  proteger solo /admin/* ──
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !tieneCookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  // Corre en casi todo (para poder rutear el subdominio admin), excepto assets estáticos.
  matcher: ['/((?!_next/static|_next/image).*)'],
}
