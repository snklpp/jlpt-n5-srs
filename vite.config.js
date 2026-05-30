import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works whether served from a domain root or a subpath.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "dist" },
});
