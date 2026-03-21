import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  GATEWAY_PORT: z.coerce.number().default(8285),
  GATEWAY_BASE_URL: z.string().default("http://localhost:8285"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Google OAuth (required for login)
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("Invalid environment variables:", result.error.format());
      process.exit(1);
    }
    _env = result.data;
  }
  return _env!;
}

export { envSchema };
