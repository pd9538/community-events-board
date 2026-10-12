import { NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "@/lib/auth";

export function getAuthUser(request: Request): JwtPayload | null {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.substring(7);

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAdmin(request: Request) {
  const user = getAuthUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}