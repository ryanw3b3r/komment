import { createApp } from "vue";
import App from "./App.vue";
import { createKomment } from "../index";

const app = createApp(App);

// Install Komment plugin
app.use(
  createKomment({
    apiEndpoint: "http://localhost:3001/api/comments",
    autoEnable: true,
    forceEnable: true, // Enable even in production for demo purposes
    author: "Demo User",
    enableLiveUpdates: true,
    buttonPosition: "bottom-right",
  })
);

app.mount("#app");
