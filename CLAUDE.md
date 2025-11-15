# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Komment is a collaborative commenting tool for Vue 3.5+ applications. It consists of a Vue plugin (frontend) and an Express server (backend) that work together to enable click-to-comment functionality with real-time updates via Server-Sent Events (SSE).

## Development Commands

### Running the Application
```bash
# Start both dev server and backend concurrently
npm run dev

# Start only the Vite dev server (frontend)
vite

# Start only the backend server
npm run server
```

### Building
```bash
# Build the library (creates dist/ folder with ES and UMD bundles)
npm run build

# Type-check without building
vue-tsc --noEmit
```

### Testing
```bash
# Preview the built library
npm run preview
```

## Architecture

### Frontend (src/)

The frontend is a Vue 3.5 plugin built with the Composition API and TypeScript:

1. **Plugin System** (`src/plugin.ts`):
   - Exports `createKomment()` which creates a Vue plugin
   - Mounts the Komment component in a separate div (`#komment-root`) outside the main app
   - This allows Komment to overlay any Vue application without conflicts

2. **Core Component** (`src/components/Komment.vue`):
   - Main orchestrator that manages commenting mode state
   - Handles button visibility based on `autoEnable`/`forceEnable` options
   - Freezes page interaction when in commenting mode using pointer-events

3. **Sub-components**:
   - `CommentMarker.vue`: Blue circular markers that show comment positions
   - `CommentPopup.vue`: Modal for creating/viewing/editing comments

4. **State Management** (`src/composables/useComments.ts`):
   - Provides all comment CRUD operations
   - Manages SSE connection for real-time updates
   - Comments are scoped by `pageUrl` (defaults to `window.location.pathname`)

5. **Styling**:
   - Uses TailwindCSS 4.1 with `km:` prefix to avoid conflicts with host applications
   - Styles are bundled into `dist/style.css` during build
   - Tailwind configuration is in `src/style.css` using `@import "tailwindcss" prefix(km);`

### Backend (server/)

The backend is a simple Express server with file-based storage:

1. **Storage**:
   - Comments stored in `server/data/comments.json`
   - Uses in-memory file locking to prevent race conditions
   - Lock queue mechanism ensures safe concurrent writes

2. **API Endpoints**:
   - `GET /api/comments?pageUrl=/path`: Fetch comments for a page
   - `POST /api/comments`: Create a new comment
   - `PUT /api/comments/:id`: Update a comment
   - `DELETE /api/comments/:id`: Delete a comment
   - `GET /api/comments/stream?pageUrl=/path`: SSE endpoint for live updates

3. **Real-time Updates**:
   - Uses Server-Sent Events (SSE) instead of WebSockets
   - Broadcasts `comment-added`, `comment-updated`, `comment-deleted` events
   - Each page has its own SSE client pool keyed by `pageUrl`

### Build Configuration

- **Vite** (`vite.config.ts`):
  - Builds as a library with ES and UMD formats
  - Vue is marked as external (peer dependency)
  - CSS is extracted to `style.css`
  - TypeScript definitions generated via `vite-plugin-dts`

- **TypeScript** (`tsconfig.json`):
  - Strict mode enabled
  - Path alias `@/*` maps to `src/*`
  - Targets ES2020

## Key Design Patterns

### Plugin Installation Flow
1. User calls `app.use(createKomment(options))`
2. Plugin creates a new div in `document.body`
3. Plugin mounts Komment component in that div with options as props
4. Component reads options and decides whether to show based on `autoEnable`/`forceEnable`

### Comment Scoping
- Comments are automatically scoped by `window.location.pathname`
- This means `/home` and `/about` have separate comment sets
- To share comments across pages, you'd need to customize `currentPageUrl` in `useComments.ts`

### SSE Architecture
- Backend maintains a Map of SSE clients grouped by `pageUrl`
- When a comment is created/updated/deleted, server broadcasts to all clients watching that page
- Frontend listens for events and updates local state reactively
- Connection auto-reconnects on error

### Style Isolation
- All Tailwind classes use `km:` prefix (configured in `src/style.css`)
- This prevents conflicts when integrated into apps with their own Tailwind setup
- The component is mounted in a separate div to avoid CSS inheritance issues

## Important Development Notes

### When Working on the Frontend
- The demo app is in `src/demo/` - use this for testing changes
- Always import from package entry points (`komment`, `komment/style.css`)
- Types are defined in `src/types/index.ts`
- Remember to export new components/composables in `src/index.ts`

### When Working on the Backend
- Server uses ES modules (`"type": "module"` in package.json)
- File locking is in-memory only - not suitable for multi-process deployments
- SSE clients are stored in memory - will be lost on server restart
- Comments file is created automatically on first run

### Build Process
1. `vue-tsc` type-checks the code
2. Vite builds the library:
   - Bundles Vue components and TS files
   - Generates type definitions
   - Extracts CSS with `km:` prefixed classes
   - Creates ES module and UMD bundle

### Package Exports
The package exports multiple entry points:
- Main: `import { createKomment } from 'komment'`
- Styles: `import 'komment/style.css'`
- Components: `import { Komment } from 'komment'`
- Composable: `import { useComments } from 'komment'`
- Types: All exported from the main entry

## Extending the Project

### Adding New Component Props
1. Update the interface in `src/types/index.ts`
2. Add the prop to `Komment.vue`
3. Pass through from `plugin.ts` if needed

### Adding New API Endpoints
1. Add route handler in `server/index.js`
2. Add corresponding function in `src/composables/useComments.ts`
3. Update SSE events if real-time sync is needed

### Customizing Comment Storage
The backend's file locking and storage mechanism is in `server/index.js`. To use a different storage backend (e.g., database), replace the `readComments()` and `writeComments()` functions while maintaining the same lock pattern.
