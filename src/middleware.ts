
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const token = req.nextauth.token as any
        const role = token?.role || 'GUEST'

        // Admin Access (Admin only)
        if (pathname.startsWith('/admin') && role !== 'ADMIN') {
            const redirectUrl = role === 'RECEPTION' ? '/reception' :
                role === 'PROFESSOR' ? '/coordinator/professor' : '/'
            const url = req.nextUrl.clone()
            url.pathname = redirectUrl
            url.searchParams.set('error', 'AccessDenied')
            return NextResponse.redirect(url)
        }

        // Coordinator Access (Admin & Coordinator)
        if (pathname.startsWith('/coordinator') && !['ADMIN', 'COORDINATOR'].includes(role)) {
            const redirectUrl = role === 'RECEPTION' ? '/reception' : '/'
            return NextResponse.redirect(new URL(`${redirectUrl}?error=AccessDenied`, req.url))
        }

        // Reception Access (Admin, Coordinator & Reception)
        if (pathname.startsWith('/reception') && !['ADMIN', 'COORDINATOR', 'RECEPTION'].includes(role)) {
            return NextResponse.redirect(new URL('/', req.url))
        }

        // Professor Access (Admin, Coordinator & Professor)
        if (pathname.startsWith('/professor') && !['ADMIN', 'COORDINATOR', 'PROFESSOR'].includes(role)) {
            return NextResponse.redirect(new URL('/', req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ['/admin/:path*', '/coordinator/:path*', '/reception/:path*', '/professor/:path*']
}
