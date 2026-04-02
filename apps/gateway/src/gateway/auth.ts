import { randomBytes } from "node:crypto";
import { Router } from "express";
import { eq, and } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import {
  oauthAccessTokens,
  serviceConnections,
  users,
} from "@datatorag-mcp/db";

const GWS_SCOPES = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/contacts",
  "https://www.googleapis.com/auth/tasks",
].join(" ");

/**
 * Dashboard authentication and service connection routes.
 *
 * GET /auth/google               — redirect to Google consent screen (login)
 * GET /auth/google/callback      — exchange code, set session cookie
 * GET /auth/google/connect       — redirect to Google with full GWS scopes
 * GET /auth/google/connect/callback — store GWS tokens for user
 */
export function createAuthRouter(
  db: Database,
  config: {
    googleClientId: string;
    googleClientSecret: string;
    gwsClientId: string;
    gwsClientSecret: string;
    baseUrl: string;
  }
): Router {
  const router = Router();

  // --- Dashboard login (minimal scopes) ---

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
      access_token: string;
    };

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${googleTokens.access_token}` } }
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

    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

  // --- Logout ---

  router.post("/auth/logout", async (req, res) => {
    const sessionToken = req.cookies?.dtrmcp_session;
    if (sessionToken) {
      await db
        .update(oauthAccessTokens)
        .set({ revokedAt: new Date() })
        .where(eq(oauthAccessTokens.token, sessionToken));
    }
    res.clearCookie("dtrmcp_session", { path: "/" });
    res.redirect("/");
  });

  // --- Google Workspace connection (full scopes) ---

  router.get("/auth/google/connect", (req, res) => {
    // Require session cookie
    const sessionToken = req.cookies?.dtrmcp_session;
    if (!sessionToken) {
      res.redirect("/auth/login");
      return;
    }

    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    googleAuthUrl.searchParams.set("client_id", config.gwsClientId);
    googleAuthUrl.searchParams.set(
      "redirect_uri",
      `${config.baseUrl}/auth/google/connect/callback`
    );
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", GWS_SCOPES);
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");

    res.redirect(googleAuthUrl.toString());
  });

  router.get("/auth/google/connect/callback", async (req, res) => {
    const googleCode = req.query.code as string | undefined;
    const sessionToken = req.cookies?.dtrmcp_session;

    if (!sessionToken) {
      res.redirect("/auth/login");
      return;
    }

    if (!googleCode) {
      res.redirect("/dashboard/connections?error=missing_code");
      return;
    }

    // Resolve userId from session
    const [session] = await db
      .select({ userId: oauthAccessTokens.userId })
      .from(oauthAccessTokens)
      .where(eq(oauthAccessTokens.token, sessionToken))
      .limit(1);

    if (!session) {
      res.redirect("/auth/login");
      return;
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code: googleCode,
          client_id: config.gwsClientId,
          client_secret: config.gwsClientSecret,
          redirect_uri: `${config.baseUrl}/auth/google/connect/callback`,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      res.redirect("/dashboard/connections?error=token_exchange_failed");
      return;
    }

    const tokens = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    const expiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    // Upsert the connection
    const existing = await db
      .select({ id: serviceConnections.id })
      .from(serviceConnections)
      .where(
        and(
          eq(serviceConnections.userId, session.userId),
          eq(serviceConnections.service, "google-workspace")
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(serviceConnections)
        .set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? null,
          scopes: tokens.scope ?? GWS_SCOPES,
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(serviceConnections.id, existing[0].id));
    } else {
      await db.insert(serviceConnections).values({
        userId: session.userId,
        service: "google-workspace",
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        scopes: tokens.scope ?? GWS_SCOPES,
        tokenExpiresAt: expiresAt,
      });
    }

    res.redirect("/dashboard/connections?connected=google-workspace");
  });

  return router;
}
