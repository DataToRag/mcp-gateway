import Image from "next/image";

export default function LoginPage() {
  const baseUrl =
    process.env.GATEWAY_BASE_URL ?? "http://localhost:8285";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-fade-in-up w-full max-w-sm px-4">
        <div className="rounded-[var(--radius)] border border-border bg-background p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="text-center">
            <Image
              src="/datatorag-logo-256.png"
              alt="DataToRAG"
              width={40}
              height={40}
              className="mx-auto"
            />
            <h1 className="mt-4 font-display text-lg font-bold text-primary">
              Sign in to DataToRAG
            </h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              Connect your MCP client to open-source tools
            </p>
          </div>

          <div className="mt-8">
            <a
              href={`/oauth/authorize?response_type=code&client_id=web&redirect_uri=${encodeURIComponent(baseUrl + "/oauth/callback")}&code_challenge=placeholder&code_challenge_method=S256`}
              className="flex w-full items-center justify-center gap-3 rounded-[var(--radius)] border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:border-muted-foreground/30 hover:shadow-sm"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-medium text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6">
            <label className="text-[13px] font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="mt-1.5 w-full rounded-[var(--radius)] border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="mt-3 w-full rounded-[var(--radius)] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
              Send Magic Link
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              We&apos;ll email you a sign-in link. No password needed.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          By signing in, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
