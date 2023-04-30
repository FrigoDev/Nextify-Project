import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
export const config = {
  matcher: ["/", "/login", "/api/hello", "/api/auth/"],
};

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.SECRET });

  const { pathname } = req.nextUrl;
  if (token && pathname === "/login" && (token?.accessTokenExpires && token.accessTokenExpires > Date.now())) {
    return NextResponse.redirect(`${process.env.SPOTIFY_REDIRECT_URI}/`);
  }
  if (pathname.match(/\/api\/auth\//) || (token?.accessTokenExpires && token.accessTokenExpires > Date.now())) {
    return NextResponse.next();
  }
  if (pathname !== "/login"  && ((!token) || (token?.accessTokenExpires && token.accessTokenExpires < Date.now())) ) {
    return NextResponse.redirect(`${process.env.SPOTIFY_REDIRECT_URI}/login`);
  }
}