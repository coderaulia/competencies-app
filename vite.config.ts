import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";

export default defineConfig({
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("/vue/") ||
            id.includes("/@vue/") ||
            id.includes("/pinia/") ||
            id.includes("/vue-router/") ||
            id.includes("/@vueuse/")
          ) {
            return "framework";
          }

          if (
            id.includes("/naive-ui/") ||
            id.includes("/@css-render/") ||
            id.includes("/css-render/") ||
            id.includes("/seemly/") ||
            id.includes("/vooks/") ||
            id.includes("/vueuc/")
          ) {
            if (id.includes("/naive-ui/es/data-table/")) {
              return "naive-ui-data";
            }

            if (
              /\/naive-ui\/es\/(form|input|input-number|select|upload|checkbox|radio|switch|date-picker|time-picker|dynamic-input|cascader|tree-select|modal|card|tabs|grid|tag|button)\//.test(
                id
              )
            ) {
              return "naive-ui-ui";
            }

            return "naive-ui-core";
          }

          if (id.includes("/@vicons/")) {
            return "icons";
          }

          if (id.includes("/echarts/") || id.includes("/zrender/")) {
            if (id.includes("/echarts/renderers/")) {
              return "charts-renderers";
            }

            if (
              id.includes("/echarts/charts/") ||
              id.includes("/echarts/components/")
            ) {
              return "charts-features";
            }

            if (id.includes("/echarts/core") || id.includes("/zrender/")) {
              return "charts-core";
            }

            return "charts";
          }

          if (id.includes("/@pdftron/")) {
            return "pdftron";
          }

          if (id.includes("/pusher-js/")) {
            return "realtime";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
