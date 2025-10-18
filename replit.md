# Collaborative Whiteboard Application

## Overview

A real-time collaborative whiteboard application that enables teams to draw, annotate, and collaborate together across web browsers, tablets, and mobile devices. The application features a canvas-first design optimized for touch interactions, with real-time presence indicators showing active collaborators. Users can join sessions instantly via shareable links or QR codes, making it ideal for remote team collaboration and brainstorming sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing
- Single-page application (SPA) architecture with dynamic route handling

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and caching
- Local component state using React hooks for UI interactions
- Real-time synchronization handled through Socket.IO client connections
- Custom query client configuration with infinite stale time to reduce unnecessary refetches

**UI Component System**
- shadcn/ui components built on Radix UI primitives for accessible, composable UI elements
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for managing component variants
- Custom theming system supporting both light and dark modes with CSS variables

**Design System Principles**
- Canvas-first approach maximizing drawing space with minimal UI obstruction
- Touch-optimized controls for mobile and tablet devices
- Fluent Design principles for consistency, inspired by Figma/Miro patterns
- Inter font family from Google Fonts for clean typography
- Responsive breakpoint at 768px for mobile/desktop differentiation

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and REST API endpoints
- Node.js runtime with ES modules (type: "module")
- HTTP server wrapped with Socket.IO for WebSocket communication
- Custom middleware for request logging and error handling

**Real-Time Communication**
- Socket.IO for bidirectional, event-based communication
- Room-based architecture where each whiteboard session is a separate room
- Event-driven updates for drawing strokes, cursor positions, and user presence
- In-memory session storage for active whiteboard state

**Data Storage Strategy**
- In-memory storage implementation (server/storage.ts) for session data
- PostgreSQL schema defined with Drizzle ORM for persistent storage capability
- Session data includes: strokes, images, text annotations, shapes, and active users
- User color assignment from predefined palette for visual differentiation

**API Design**
- RESTful endpoints for session creation (`POST /api/sessions`)
- WebSocket events for real-time collaboration features
- Session-based architecture without authentication (anonymous collaboration)

### Database Architecture

**ORM & Schema Management**
- Drizzle ORM with PostgreSQL dialect for type-safe database operations
- Schema defined in shared/schema.ts for code sharing between client and server
- Zod integration for runtime validation of database inputs
- Migration files managed in ./migrations directory

**Database Tables**
- `users` table: id (UUID), username, password (for future authentication)
- `whiteboard_sessions` table: id (UUID), name, created_at timestamp
- Type-safe TypeScript interfaces generated from schema definitions

**Data Models**
- DrawingStroke: points array with x/y coordinates and pressure sensitivity
- ActiveUser: id, username, and assigned color for presence indicators
- Canvas entities: Images (with dataUrl), Text (with positioning), Shapes (rectangles, circles, arrows)
- All entities use UUID-based identification

### External Dependencies

**Third-Party Services**
- Neon Database (@neondatabase/serverless) for serverless PostgreSQL hosting
- Socket.IO for WebSocket server/client communication
- QRCode library for generating session sharing QR codes

**UI Libraries**
- Radix UI component primitives (15+ components including Dialog, Popover, Dropdown, etc.)
- Lucide React for icon system
- date-fns for date formatting and manipulation
- cmdk for command palette functionality

**Development Tools**
- Replit-specific plugins: vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner
- tsx for TypeScript execution in development
- esbuild for production server bundling
- drizzle-kit for database migrations

**Build & Deployment**
- Production build: Vite bundles client, esbuild bundles server
- Development: Concurrent Vite dev server with Express middleware mode
- Static assets served from dist/public in production
- Environment variable required: DATABASE_URL for PostgreSQL connection