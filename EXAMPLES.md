# Komment Usage Examples

This document provides detailed examples of how to use Komment in various scenarios.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Vue 3.5 Projects](#vue-35-projects)
- [Nuxt.js Integration](#nuxtjs-integration)
- [Custom Server Configuration](#custom-server-configuration)
- [Advanced Customization](#advanced-customization)
- [Multiple Pages](#multiple-pages)
- [User Authentication](#user-authentication)

---

## Basic Setup

### Minimal Configuration

```typescript
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createKomment } from "komment";
import "komment/style.css";

const app = createApp(App);
app.use(createKomment());
app.mount("#app");
```

This uses all default settings:

- API endpoint: `http://localhost:3001/api/comments`
- Auto-enable in development only
- Live updates enabled
- Button position: bottom-right
- Author: Anonymous

---

## Vue 3.5 Projects

### Standard Vue Application

```typescript
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createKomment } from "komment";
import "komment/style.css";

const app = createApp(App);

app.use(
  createKomment({
    apiEndpoint:
      import.meta.env.VITE_KOMMENT_API || "http://localhost:3001/api/comments",
    author: localStorage.getItem("username") || "Anonymous",
    buttonPosition: "bottom-right",
    enableLiveUpdates: true,
  })
);

app.mount("#app");
```

### With Vue Router

```typescript
// main.ts
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import { createKomment } from "komment";
import "komment/style.css";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // your routes
  ],
});

const app = createApp(App);

app.use(router);
app.use(
  createKomment({
    apiEndpoint: "http://localhost:3001/api/comments",
    author: "Current User",
  })
);

app.mount("#app");
```

Comments will automatically be scoped to each route path.

---

## Nuxt.js Integration

### As a Plugin

Create a plugin file:

```typescript
// plugins/komment.client.ts
import { createKomment } from "komment";
import "komment/style.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(
    createKomment({
      apiEndpoint:
        useRuntimeConfig().public.kommentApi ||
        "http://localhost:3001/api/comments",
      author: "Nuxt User",
      forceEnable: process.env.NODE_ENV !== "production",
    })
  );
});
```

### Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      kommentApi: process.env.KOMMENT_API_ENDPOINT,
    },
  },
});
```

---

## Custom Server Configuration

### Using a Custom Port

```bash
# Start server on port 4000
PORT=4000 node node_modules/komment/server/index.js
```

Then in your app:

```typescript
app.use(
  createKomment({
    apiEndpoint: "http://localhost:4000/api/comments",
  })
);
```

### Production Server Setup

For production, you might want to run the server with PM2:

```bash
# Install PM2
npm install -g pm2

# Start the server
pm2 start node_modules/komment/server/index.js --name komment-server

# Save the process list
pm2 save

# Setup auto-start on boot
pm2 startup
```

### Behind a Reverse Proxy (nginx)

```nginx
# nginx.conf
location /api/comments {
    proxy_pass http://localhost:3001/api/comments;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;

    # For SSE
    proxy_set_header Connection '';
    proxy_buffering off;
    chunked_transfer_encoding off;
}
```

Then use:

```typescript
app.use(
  createKomment({
    apiEndpoint: "https://yourdomain.com/api/comments",
  })
);
```

---

## Advanced Customization

### Conditional Enabling Based on User Role

```typescript
// utils/auth.ts
export function canComment() {
  const user = getCurrentUser();
  return user?.role === "admin" || user?.role === "reviewer";
}

// main.ts
import { canComment } from "./utils/auth";

app.use(
  createKomment({
    forceEnable: canComment(),
    author: getCurrentUser()?.name,
  })
);
```

### Different Button Positions for Different Pages

```typescript
import { createKomment } from "komment";
import { ref } from "vue";

const buttonPosition = ref<
  "top-left" | "top-right" | "bottom-left" | "bottom-right"
>("bottom-right");

// Change position based on route
router.afterEach((to) => {
  if (to.path.startsWith("/admin")) {
    buttonPosition.value = "top-right";
  } else {
    buttonPosition.value = "bottom-right";
  }
});

app.use(
  createKomment({
    buttonPosition: buttonPosition.value,
  })
);
```

### Using Components Directly

For more control, use the component directly:

```vue
<script setup lang="ts">
import { Komment } from "komment";
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const showComments = ref(false);

const kommentOptions = computed(() => ({
  apiEndpoint: import.meta.env.VITE_KOMMENT_API,
  author: userStore.user?.name,
  forceEnable: showComments.value,
}));
</script>

<template>
  <div>
    <button @click="showComments = !showComments">Toggle Comments</button>

    <Komment v-bind="kommentOptions" />
  </div>
</template>
```

---

## Multiple Pages

Comments are automatically scoped to the current page URL (`window.location.pathname`). This means:

- `/home` will have separate comments from `/about`
- `/products/1` will have separate comments from `/products/2`

### Shared Comments Across Pages

If you want to share comments across multiple pages, you'll need to customize the `pageUrl`:

```typescript
// Modify src/composables/useComments.ts
const currentPageUrl = computed(() => {
  // Share comments for all product pages
  if (window.location.pathname.startsWith("/products/")) {
    return "/products";
  }
  return window.location.pathname;
});
```

---

## User Authentication

### With JWT Tokens

```typescript
// main.ts
import { createKomment } from "komment";

// Get user from JWT
const token = localStorage.getItem("authToken");
const user = token ? parseJWT(token) : null;

app.use(
  createKomment({
    author: user?.name || user?.email || "Anonymous",
    // Only enable for authenticated users
    forceEnable: !!token && process.env.NODE_ENV !== "production",
  })
);
```

### With Pinia Store

```typescript
// stores/user.ts
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    username: (state) => state.user?.name || "Anonymous",
  },
});

// main.ts
import { createKomment } from "komment";
import { useUserStore } from "./stores/user";

const app = createApp(App);
app.use(createPinia());

const userStore = useUserStore();

app.use(
  createKomment({
    author: userStore.username,
  })
);

app.mount("#app");
```

---

## Environment Variables

Create a `.env` file:

```bash
# .env
VITE_KOMMENT_API=http://localhost:3001/api/comments
VITE_KOMMENT_AUTHOR=Development User
VITE_ENABLE_KOMMENT=true
```

Use in your app:

```typescript
app.use(
  createKomment({
    apiEndpoint: import.meta.env.VITE_KOMMENT_API,
    author: import.meta.env.VITE_KOMMENT_AUTHOR,
    forceEnable: import.meta.env.VITE_ENABLE_KOMMENT === "true",
  })
);
```

---

## Docker Deployment

### Dockerfile for Server

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server/ ./server/

EXPOSE 3001

CMD ["node", "server/index.js"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  komment-server:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/server/data
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
```

---

## Troubleshooting Examples

### Enable Debug Logging

Modify `src/composables/useComments.ts` to add logging:

```typescript
async function saveComment(payload: CommentPayload) {
  console.log("[Komment] Saving comment:", payload);

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("[Komment] Server response:", response.status);
    // ... rest of the code
  } catch (err) {
    console.error("[Komment] Error saving comment:", err);
  }
}
```

### Testing Without Server

For unit testing, you can mock the API:

```typescript
import { vi } from "vitest";

global.fetch = vi.fn((url) => {
  if (url.includes("/api/comments")) {
    return Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          data: [],
        }),
    });
  }
});
```

---

## Best Practices

1. **Always set an author**: This helps identify who left which comment
2. **Use environment variables**: Don't hardcode API endpoints
3. **Disable in production**: Unless you have a specific use case
4. **Set up authentication**: Control who can leave comments
5. **Regular backups**: Back up your `server/data/comments.json` file
6. **Use HTTPS in production**: Especially for the SSE connection

---

For more information, see the main [README.md](./README.md).
