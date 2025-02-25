import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/WithElim/", // ✅ 这里要匹配 GitHub Pages 的 repo name
});
