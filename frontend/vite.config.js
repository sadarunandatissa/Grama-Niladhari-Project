import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {}, // 👈 This forces Vite to use an empty inline config instead of scanning your folders
  },
});
