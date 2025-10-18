# Collaborative Whiteboard Design Guidelines

## Design Approach

**System-Based Approach** using Fluent Design principles for Microsoft Teams integration consistency, combined with inspiration from Figma and Miro for whiteboard-specific patterns. The interface prioritizes the canvas workspace with floating, non-intrusive controls.

**Core Principles:**
- Canvas-first: Maximum drawing space with minimal UI obstruction
- Touch-optimized: Finger-friendly controls for mobile/tablet
- Instant collaboration: Real-time presence and zero-friction joining

---

## Color Palette

**Dark Mode (Primary):**
- Background Canvas: 220 20% 12% (deep slate for eye comfort)
- UI Panels: 220 18% 16% (slightly lighter floating panels)
- Primary Accent: 210 100% 60% (vibrant blue for tools/actions)
- Success/Active: 142 76% 36% (green for active users)
- Text Primary: 0 0% 98%
- Text Secondary: 220 15% 70%

**Light Mode:**
- Background Canvas: 0 0% 98% (soft white)
- UI Panels: 0 0% 100% with subtle shadow
- Primary Accent: 210 100% 50%
- Border/Divider: 220 15% 90%

---

## Typography

**Fonts:** Inter (UI) via Google Fonts CDN
- Tool Labels: 14px, medium (500)
- User Names: 13px, regular
- Canvas Text: 16px-24px scalable, regular
- Buttons: 14px, medium

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 3, 4, 6, 8, 12
- Toolbar padding: p-3
- Panel spacing: p-6
- Tool icon gaps: gap-2
- User avatars: gap-3

**Canvas Structure:**
- Full-viewport canvas (100vw/100vh)
- Floating toolbars positioned absolute with backdrop-blur
- Collapsible side panels (320px width) for collaboration/settings

---

## Component Library

### A. Core Canvas
- Infinite pannable/zoomable workspace
- Grid overlay (toggleable, 220 15% 85% at 10% opacity)
- Multi-touch gesture support (pinch zoom, two-finger pan)

### B. Floating Toolbar (Top)
- Semi-transparent panel (backdrop-blur-md, bg-opacity-95)
- Tools: Select, Pen, Shapes, Text, Eraser, Sticky Notes
- Rounded pill design (rounded-full) with icon buttons (h-10 w-10)
- Color picker dropdown with recent colors
- Stroke width slider (1-12px)

### C. Collaboration Panel (Right Sidebar)
- Active users list with colored avatars (h-8 w-8 rounded-full)
- Real-time cursors with name labels on canvas
- QR code display (256x256px) for easy joining
- Share link with copy button
- Teams integration status indicator

### D. Mobile Touch Controls
- Bottom toolbar for phones (h-16, safe-area-inset-bottom)
- Large touch targets (min 44x44px)
- Gesture hints for first-time users
- Palm rejection for drawing accuracy
- Quick tool switching with hold gesture

### E. Authentication Flow
- Simple modal overlay for QR code scan
- Username input (max-w-sm, h-12 input)
- Auto-join on successful scan
- Guest mode (no account required)

### F. Navigation & Actions
- Hamburger menu (top-left) for settings/export
- Zoom controls (bottom-right, fixed positioning)
- Undo/Redo floating buttons (bottom-left)
- Export options: PNG, SVG, PDF

### G. Real-time Indicators
- Typing indicators for text tool users
- Selection highlights when multiple users select same object
- Version conflict resolver (rare, modal overlay)

---

## Responsive Strategy

**Desktop (lg+):** All panels visible, keyboard shortcuts enabled
**Tablet (md):** Collapsible sidebar, gesture-optimized
**Mobile (base):** Bottom toolbar only, hide sidebar default, single-tap color/tool switching

---

## Images

**No hero image needed** - this is a utility app where the canvas IS the hero element. The initial blank canvas should feel inviting and ready to use.

**Icon Library:** Heroicons (outline style) via CDN for consistency

---

## Animations

**Minimal approach:**
- Smooth canvas zoom (transform with 200ms ease)
- Cursor trail fade for remote users (300ms)
- Tool selection highlight (scale 0.95→1.0, 150ms)
- Panel slide-in/out (translate-x, 250ms ease-out)

**No loading spinners** - instant feedback with optimistic UI updates

---

## Teams Integration Specifics

- Display "Connected to Teams" badge in top-right
- Screen share indicator when active (subtle pulsing dot)
- Pointer tracking from Teams participants shown as distinct color
- Auto-pause drawing when Teams controls are active

---

## Accessibility & Polish

- Keyboard navigation for all tools (Tab, Arrow keys)
- High contrast mode toggle
- Touch-friendly minimum sizes everywhere
- Clear focus indicators (2px ring offset)
- Collaborative cursors never overlap UI elements