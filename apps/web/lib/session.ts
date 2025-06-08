"use server";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
    user: {
        id: string;
        name: string;
    }
    accessToken: string;
    refreshToken: string;
}

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET_KEY);

export async function createSession(payload: Session){
    const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt().setExpirationTime("7d")
        .sign(secretKey);

    (await cookies()).set("session", session, {
        httpOnly: true,
        secure: true,
        expires: expiredAt,
        sameSite: "lax",
        path: "/",
    });
}

export async function getSession(){
    const cookie = (await cookies()).get("session")?.value;
    if (!cookie) return null;

    try{const { payload } = await jwtVerify(cookie, secretKey, {
        algorithms: ["HS256"],
    })

    return payload as Session;
    }catch(err){
        console.error("Failed to verify session token", err);
        redirect("/auth/signin");
    }
}

export async function deleteSession(){
    await (await cookies()).delete("session");
}

export async function updateTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;

  const { payload } = await jwtVerify<Session>(
    cookie,
    secretKey
  );

  if (!payload) throw new Error("Session not found");

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };

  await createSession(newPayload);
}