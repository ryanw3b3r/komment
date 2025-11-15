# Komment 💬

> A collaborative commenting tool for your application - perfect for design reviews, feedback collection, and team collaboration.

[![npm version](https://img.shields.io/npm/v/komment.svg)](https://www.npmjs.com/package/komment)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features ✨

- 🎯 **Click-to-Comment**: Simply click anywhere on your page to add comments
- 🔄 **Real-time Updates**: See comments from other users instantly via Server-Sent Events
- 🎨 **Beautiful UI**: Built with TailwindCSS 4.1 for a modern, clean interface
- 🔒 **Thread-safe**: File-based storage with locking mechanism prevents race conditions
- ⚙️ **Auto-enable**: Automatically enables in non-production environments
- 📦 **Zero Config**: Works out of the box with sensible defaults
- 🎭 **Customizable**: Configure button position, API endpoint, and more
- 💪 **TypeScript**: Full TypeScript support with type definitions

## Installation 📦

```bash
npm install komment
```

## Quick Start 🚀

### 1. Start the Backend Server

Komment requires a backend server to store and sync comments. Start it with:

```bash
# Start the server directly
node node_modules/komment/server/index.js

# Or add to your package.json scripts
"scripts": {
  "komment": "node node_modules/komment/server/index.js"
}
```

The server will run on `http://localhost:3001` by default.

### 2. Add to Your Vue Application

```typescript
// main.ts
import { createApp } from "vue";
import App from "./App.vue";
import { createKomment } from "komment";
import "komment/style.css";

const app = createApp(App);

// Install Komment plugin
app.use(
  createKomment({
    apiEndpoint: "http://localhost:3001/api/comments",
    author: "John Doe", // Optional: set the current user's name
    buttonPosition: "bottom-right", // Optional: button position
    enableLiveUpdates: true, // Optional: enable real-time updates
  })
);

app.mount("#app");
```

### 3. Start Commenting!

That's it! The comment button will appear automatically in development mode. Click it to start adding comments to your pages.

## Configuration Options ⚙️

```typescript
interface KommentOptions {
  /**
   * API endpoint for saving/loading comments
   * @default 'http://localhost:3001/api/comments'
   */
  apiEndpoint?: string;

  /**
   * Enable auto-initialization in non-production environments
   * @default true
   */
  autoEnable?: boolean;

  /**
   * Force enable even in production
   * @default false
   */
  forceEnable?: boolean;

  /**
   * Current user's name/identifier
   */
  author?: string;

  /**
   * Enable live updates via SSE
   * @default true
   */
  enableLiveUpdates?: boolean;

  /**
   * Position of the comment button
   * @default 'bottom-right'
   */
  buttonPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}
```

## Usage Guide 📖

### Adding Comments

1. Click the **"Comment"** button (bottom-right corner by default)
2. Your cursor changes to a crosshair, and the page freezes
3. Click anywhere on the page where you want to add a comment
4. Type your comment in the popup
5. Click **"Save"** to save or **"Cancel"** to discard
6. Click **"Finish"** to exit commenting mode

### Viewing Comments

- Hover over blue comment markers to see the comment
- Comments show the author's name and timestamp
- Delete comments by clicking the trash icon

### Keyboard Shortcuts

- **Esc**: Cancel/close popup
- **Cmd/Ctrl + Enter**: Save comment

## Server Setup 🖥️

The backend server is built with Express and stores comments in a JSON file with file locking to prevent race conditions.

### Custom Server Configuration

You can customize the server port:

```bash
PORT=4000 node server/index.js
```

### API Endpoints

- `GET /api/comments?pageUrl=/path`: Get all comments for a page
- `POST /api/comments`: Create a new comment
- `PUT /api/comments/:id`: Update a comment
- `DELETE /api/comments/:id`: Delete a comment
- `GET /api/comments/stream?pageUrl=/path`: SSE endpoint for live updates

## Development 🛠️

### Running the Demo

```bash
# Install dependencies
npm install

# Run both dev server and backend concurrently
npm run dev

# Or run them separately in different terminals:
# Terminal 1: npm run server
# Terminal 2: vite
```

Visit `http://localhost:5173` to see the demo application.

### Building the Package

```bash
npm run build
```

This creates the distributable files in the `dist/` directory.

## Project Structure 📁

```
komment/
├── src/
│   ├── components/
│   │   ├── Komment.vue          # Main component
│   │   ├── CommentMarker.vue    # Comment marker UI
│   │   └── CommentPopup.vue     # Comment input popup
│   ├── composables/
│   │   └── useComments.ts       # Comments logic & API
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── demo/
│   │   ├── App.vue              # Demo application
│   │   └── main.ts              # Demo entry point
│   ├── plugin.ts                # Vue plugin
│   ├── index.ts                 # Main entry point
│   └── style.css                # Styles (includes Tailwind config)
├── server/
│   └── index.js                 # Express server
├── dist/                        # Built files (generated)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Architecture 🏗️

### Frontend

- **Vue 3.5**: Composition API with `<script setup>`
- **TypeScript**: Full type safety
- **TailwindCSS 4.1**: Utility-first styling with `km:` prefix to avoid conflicts
- **Vite**: Fast build tool and dev server

### Backend

- **Express**: Lightweight HTTP server
- **File-based Storage**: Comments stored in JSON with file locking
- **Server-Sent Events**: Real-time updates without WebSockets

### Communication

- **REST API**: For creating, reading, and deleting comments
- **SSE**: For pushing live updates to all connected clients

## Advanced Usage 🔥

### Using Components Directly

You can import and use components directly instead of using the plugin:

```vue
<script setup lang="ts">
import { Komment } from "komment";
import "komment/style.css";
</script>

<template>
  <Komment
    :api-endpoint="'http://localhost:3001/api/comments'"
    :author="'Jane Doe'"
    :force-enable="true"
  />
</template>
```

### Using the Composable

For advanced use cases, you can use the `useComments` composable directly:

```typescript
import { useComments } from "komment";

const {
  comments,
  isLoading,
  error,
  fetchComments,
  saveComment,
  deleteComment,
  setupLiveUpdates,
  cleanup,
} = useComments({
  apiEndpoint: "http://localhost:3001/api/comments",
  enableLiveUpdates: true,
});

// Fetch comments
await fetchComments();

// Save a comment
await saveComment({
  x: 100,
  y: 200,
  text: "Great design!",
  author: "John",
  pageUrl: "/",
});
```

## Production Deployment 🚀

### Disable in Production

By default, Komment is disabled in production. This is controlled by the `autoEnable` option:

```typescript
app.use(
  createKomment({
    autoEnable: true, // Only enables in development
  })
);
```

### Force Enable in Production

To enable in production (e.g., for staging environments):

```typescript
app.use(
  createKomment({
    forceEnable: true, // Always enabled
  })
);
```

Or use environment variables:

```typescript
app.use(
  createKomment({
    forceEnable: process.env.VITE_ENABLE_KOMMENT === "true",
  })
);
```

## Browser Support 🌐

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

Komment uses modern browser features like EventSource (SSE), so IE11 is not supported.

## Troubleshooting 🔧

### Comments not appearing

1. Make sure the server is running: `npm run server`
2. Check the console for errors
3. Verify the `apiEndpoint` is correct
4. Ensure you're not in production mode (unless `forceEnable: true`)

### Live updates not working

1. Check that `enableLiveUpdates: true` is set
2. Verify the server SSE endpoint is accessible
3. Check browser console for SSE connection errors

### Style conflicts

Komment uses the `km:` prefix for all Tailwind classes to avoid conflicts. If you still experience issues, you can customize the Tailwind configuration.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

MIT © Ryan Weber Ltd

## Support 💬

- 🐛 [Report Issues](https://github.com/ryanw3b3r/komment/issues)
- 💡 [Request Features](https://github.com/ryanw3b3r/komment/issues)

---

Made with ❤️ by Ryan Weber Ltd for better collaboration
