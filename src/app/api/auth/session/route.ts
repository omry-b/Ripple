import { NextResponse } from "next/server";
import { getFirebaseAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { FIREBASE_SESSION_COOKIE } from "@/lib/auth/session";

const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 503 });
  }

  const body = (await request.json()) as { idToken?: string };
  if (!body.idToken) {
    return NextResponse.json({ error: "idToken required" }, { status: 400 });
  }

  const sessionCookie = await getFirebaseAdminAuth().createSessionCookie(body.idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const res = NextResponse.json({ ok: true, asOf: new Date().toISOString() });
  res.cookies.set(FIREBASE_SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, asOf: new Date().toISOString() });
  res.cookies.set(FIREBASE_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
