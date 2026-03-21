import { createHash, randomBytes } from "node:crypto";
import { Router } from "express";
import { eq, and, isNull } from "drizzle-orm";
import type { Database } from "@datatorag-mcp/db";
import {
  oauthAuthorizationCodes,
  oauthAccessTokens,
} from "@datatorag-mcp/db";

/**
 * OAuth2 Token Endpoint
 *
 * POST /oauth/token — exchange authorization code for access token
 * Requires PKCE verification (code_verifier).
 */
export function createTokenRouter(db: Database): Router {
  const router = Router();

  router.post("/oauth/token", async (req, res) => {
    const {
      grant_type,
      code,
      redirect_uri,
      client_id,
      code_verifier,
    } = req.body ?? {};

    if (grant_type !== "authorization_code") {
      res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Only authorization_code grant is supported",
      });
      return;
    }

    if (!code || !redirect_uri || !client_id || !code_verifier) {
      res.status(400).json({
        error: "invalid_request",
        error_description:
          "code, redirect_uri, client_id, and code_verifier are required",
      });
      return;
    }

    // Look up the authorization code
    const [authCode] = await db
      .select()
      .from(oauthAuthorizationCodes)
      .where(
        and(
          eq(oauthAuthorizationCodes.code, code),
          isNull(oauthAuthorizationCodes.usedAt)
        )
      )
      .limit(1);

    if (!authCode) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid or already used authorization code",
      });
      return;
    }

    // Check expiry
    if (authCode.expiresAt < new Date()) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code has expired",
      });
      return;
    }

    // Verify client_id and redirect_uri match
    if (authCode.clientId !== client_id || authCode.redirectUri !== redirect_uri) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "client_id or redirect_uri mismatch",
      });
      return;
    }

    // PKCE verification — hash the code_verifier and compare to stored code_challenge
    const computedChallenge = createHash("sha256")
      .update(code_verifier)
      .digest("base64url");

    if (computedChallenge !== authCode.codeChallenge) {
      res.status(400).json({
        error: "invalid_grant",
        error_description: "PKCE code_verifier does not match code_challenge",
      });
      return;
    }

    // Mark code as used
    await db
      .update(oauthAuthorizationCodes)
      .set({ usedAt: new Date() })
      .where(eq(oauthAuthorizationCodes.id, authCode.id));

    // Issue access token
    const accessToken = randomBytes(32).toString("base64url");
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(oauthAccessTokens).values({
      token: accessToken,
      clientId: client_id,
      userId: authCode.userId,
      scope: authCode.scope,
      expiresAt: tokenExpiresAt,
    });

    res.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 86400,
      scope: authCode.scope ?? "mcp:tools",
    });
  });

  return router;
}
