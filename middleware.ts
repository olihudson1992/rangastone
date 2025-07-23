import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Handle any routing issues by redirecting to the main page
  const pathname = request.nextUrl.pathname

  if (pathname === "/") {
    return NextResponse.next()
  }

  // For any other path, redirect to the main page
  return NextResponse.redirect(new URL("/", request.url))
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
