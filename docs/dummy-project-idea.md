# Dummy Project Idea: Startup Landing Page

A classic "SaaS Startup" landing page. This is the perfect MVP because it tests all core layout capabilities: Grids, Flexbox, Forms, and component reuse.

## Pages (5 Routes)

### 1. Home (`/`)
*   **Hero Section**: H1 headline ("Build Faster"), Subtext, "Get Started" Button (Primary Color).
*   **Logos Grid**: "Trusted by" section with 4-5 placeholder logos in a flex row.
*   **Features Grid**: 3-column grid. Each item has an Icon, Title, and Description.

### 2. About (`/about`)
*   **Team Section**: Grid of Team Member cards (Image + Name + Role).
*   **Story**: Text block explaining the "Why".

### 3. Pricing (`/pricing`)
*   **Pricing Cards**: 3 cards (Basic, Pro, Enterprise).
*   **Highlight**: "Pro" card should be slightly larger or have a border color (Component Variant testing).

### 4. Contact (`/contact`)
*   **Form**: Name, Email, Message inputs. Submit button.
*   **Map**: Placeholder image for location.

### 5. Blog (`/blog`)
*   **List View**: Vertical list of "Recent News" (Title + Excerpt).

## Technical Requirements Tested
*   **Layouts**: `RootLayout` (Navbar/Footer), `AuthLayout` (maybe later).
*   **Components**: `Card`, `Button`, `Input`.
*   **Styling**: Flexbox vs Grid, Responsive design (mobile stack vs desktop row).
