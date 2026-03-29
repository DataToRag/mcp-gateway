import { randomBytes } from "node:crypto";
import { Router } from "express";
import { eq } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import { oauthAccessTokens, users } from "@datatorag-mcp/db";

/**
 * Dashboard authentication routes (separate from MCP OAuth).
 *
 * GET /auth/google          — redirect to Google consent screen
 * GET /auth/google/callback — exchange code, set session cookie, redirect to /dashboard
 */
export function createAuthRouter(
  db: Database,
  config: {
    googleClientId: string;
    googleClientSecret: string;
    baseUrl: string;
  }
): Router {
  const router = Router();

  router.get("/auth/google", (_req, res) => {
    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAuthUrl.searchParams.set("client_id", config.googleClientId);
    googleAuthUrl.searchParams.set(
      "redirect_uri",
      `${config.baseUrl}/auth/google/callback`
    );
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("prompt", "select_account");

    res.redirect(googleAuthUrl.toString());
  });

  router.get("/auth/google/callback", async (req, res) => {
    const googleCode = req.query.code as string | undefined;

    if (!googleCode) {
      res.status(400).send("Missing code from Google");
      return;
    }

    // Exchange Google auth code for tokens
    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: googleCode,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: `${config.baseUrl}/auth/google/callback`,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      res.status(500).send("Failed to exchange Google auth code");
      return;
    }

    const googleTokens = (await tokenResponse.json()) as {
      id_token?: string;
      access_token: string;
    };

    // Fetch user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${googleTokens.access_token}` },
      }
    );

    if (!userInfoResponse.ok) {
      res.status(500).send("Failed to fetch Google user info");
      return;
    }

    const googleUser = (await userInfoResponse.json()) as {
      email: string;
      name?: string;
      picture?: string;
    };

    // Find or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, googleUser.email))
      .limit(1);

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email: googleUser.email,
          name: googleUser.name ?? null,
          emailVerified: true,
          avatarUrl: googleUser.picture ?? null,
        })
        .returning();
    }

    // Issue session token
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await db.insert(oauthAccessTokens).values({
      token,
      clientId: "web",
      userId: user.id,
      scope: null,
      expiresAt,
    });

    res.cookie("dtrmcp_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    res.redirect("/dashboard");
  });

  return router;
}
