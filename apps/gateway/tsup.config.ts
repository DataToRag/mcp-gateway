import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["server.ts"],
  format: ["esm"],
  clean: true,
});
