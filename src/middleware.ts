import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const publicPaths = [
    "/login",
    "/register",
    "/api/auth",
    "/api/register",
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
