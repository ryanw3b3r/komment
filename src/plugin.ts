import { type App, createApp, h } from "vue";
import type { KommentOptions } from "./types";
import Komment from "./components/Komment.vue";

export function createKomment(options: KommentOptions = {}) {
  return {
    install(app: App) {
      // Create a container div for Komment
      const container = document.createElement("div");
      container.id = "komment-root";
      document.body.appendChild(container);

      // Create and mount the Komment component
      const kommentApp = createApp({
        render() {
          return h(Komment, options);
        },
      });

      kommentApp.mount(container);

      // Provide global access if needed
      app.config.globalProperties.$komment = kommentApp;
    },
  };
}

export default createKomment;
