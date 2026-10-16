import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages 项目页部署在 https://kenaut.github.io/BNMB/ 下，资源路径需带仓库名前缀
  base: "/BNMB/",
  plugins: [react()],
  test: {
    environment: "node",
  },
});
