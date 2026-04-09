import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Roles} from '@/utils/enum';
import { cookies } from 'next/headers'
import { JWTUserType } from '@/types/auth';
import { decodeJWT } from '@/lib/utils';

// Define public routes that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/confirm',
  '/api/login',
  '/api/logout',
  '/api/refresh_token',        // root → redirect /home
  '/home',       // Trang chủ
  '/events',     // Danh sách + chi tiết sự kiện (e.g. /events/[id])
  '/organizers', // Trang organizer (e.g. /organizers/[id])
  '/resale',     // Danh sách + chi tiết vé bán lại (e.g. /resale/[id], trade-booking)
  '/map',   
  '/',
];

// Define role-based route access - Map URL prefixes to allowed roles
// Token chỉ có USER và ADMIN. Organizer = User có organizerId (verified) - dùng role USER để vào /organizer
const rolePermissions: Record<string, Roles[]> = {
  '/admin': [Roles.ADMIN],
  '/organizer': [Roles.USER], // USER: user upgrade lên organizer (check organizerId + status ở layout/page)
  '/user': [Roles.USER],
};
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;


    const isPublic =
        publicPaths.some(path => pathname.startsWith(path)) ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public') ||
        /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(pathname) ||
        pathname === '/';

    // Case 1: Public route
    if (isPublic) {
        return NextResponse.next();
    }
    // Case 2: No refresh_token -> Middleware blocks immediately (As per AuthContext logic)
    if (!refreshToken) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // 3. Validate Access Token if it exists
    if (accessToken) {
        try {
            const user = decodeJWT<JWTUserType & { exp: number }>(accessToken);

            // Check Token Expiration
            const currentTime = Math.floor(Date.now() / 1000);
            if (user.exp < currentTime) {
                // Token Expired but Refresh Token exists (checked above).
                // Action: Redirect to same URL but delete access_token cookie.
                // This forces the browser to retry effectively as "Missing Access Token".
                // Result: AuthContext will see [No Access, Valid Refresh] -> Trigger Case 3 (Refresh Logic).
                const response = NextResponse.redirect(request.url);
                response.cookies.delete('accessToken');
                return response;
            }

            // Valid Token -> Check Role-based Access (RBAC)
            const matchedPath = Object.keys(rolePermissions).find(path => pathname.startsWith(path));
            if (matchedPath) {
                const allowedRoles = rolePermissions[matchedPath];
                const userRole = user.Role as Roles;

                if (!allowedRoles.includes(userRole)) {
                    return NextResponse.redirect(new URL('/login', request.url));
                }

                    // /organizer: USER phải có IsOrganizer = true mới được phép truy cập
                    if (matchedPath === '/organizer' && userRole === Roles.USER) {
                        const raw = user?.IsOrganizer ??  '';
                        const isOrganizer = String(raw).toLowerCase() === 'true' ;
                        if (!isOrganizer) {
                            return NextResponse.redirect(new URL('/home', request.url));
                        }
                }
            }

        } catch (error) {
            console.error("Token decoding failed:", error);
            // Invalid token structure -> Treat as expired/missing.
            // Force refresh flow by stripping the bad cookie.
            const response = NextResponse.redirect(request.url);
            response.cookies.delete('accessToken');
            return response;
        }
    }

    // Case 3: No Access Token (or stripped above), but has Refresh Token.
    // Cho phép request đi qua - AuthContext sẽ refresh token. Sau khi refresh, token mới (có IsOrganizer)
    // sẽ được set vào cookie. User có thể cần reload hoặc navigate lại nếu đang cố vào /organizer.
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg)).*)',
    ],
};
