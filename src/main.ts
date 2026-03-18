import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App";
import router from "./router";

import "./assets/tailwind.css";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

function quietDebugConsole() {
  if (import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true") {
    return;
  }

  const noop = () => undefined;
  console.log = noop;
  console.debug = noop;
  console.info = noop;
}

quietDebugConsole();

const app = createApp(App);
app.use(createPinia().use(piniaPluginPersistedstate));
app.use(router);

async function bootstrap() {
  if (
    import.meta.env.VITE_PUSHER_APP_KEY &&
    import.meta.env.VITE_PUSHER_APP_CLUSTER
  ) {
    const { PusherVue } = await import("./plugins/pusher");
    app.use(PusherVue);
  }

  app.mount("#app");
}

bootstrap();
