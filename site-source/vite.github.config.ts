import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: "github-client",
  base: "/Basoor-Family-Tree/",
  plugins: [react()],
  build: { outDir: "../github-dist", emptyOutDir: true, assetsDir: "assets" },
});
