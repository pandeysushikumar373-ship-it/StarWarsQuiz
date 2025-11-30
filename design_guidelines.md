# Design Guidelines for SearchInk - Fuzzy Search Application

## Design Approach
**Custom Dark Theme System** - The user has provided a complete design implementation with a sophisticated dark theme featuring glassmorphism and gradient accents. These guidelines formalize the existing design patterns for consistency.

## Core Design Elements

### Typography
- **Font Family**: Inter (with system fallbacks)
- **Hierarchy**:
  - H1: 18px, weight 400
  - Lead text: 13px muted
  - Body/Input: 15px
  - Small labels: 13px
  - Metadata: 12px

### Layout System
**Spacing Primitives**: Use Tailwind units of 2, 3, 4, 6, 8 for consistency
- Container max-width: 980px
- Section gaps: 16-18px (gap-4)
- Card padding: 28px outer, 14px inner (p-7, p-3.5)
- Element gaps: 10-16px (gap-2.5 to gap-4)

### Component Library

**Search Interface**:
- Prominent search input with icon overlay (right-positioned)
- Autocomplete suggestions dropdown below input
- Search button with gradient background
- Input styling: rounded-12px, subtle borders, deep shadows

**Results Display**:
- Two-column grid layout (main results + sidebar filters)
- Results column: flexible width
- Sidebar: fixed 340px width
- Mobile: stack to single column

**Card Components**:
- Rounded corners: 10-12px
- Subtle borders (rgba white 0.02-0.03)
- Hover state: translateY(-6px) with enhanced shadow
- Glass background layers with transparency

**Filter Sidebar**:
- Tag pills: rounded-full, subtle background, compact padding (6px 8px)
- Select dropdowns: transparent background, minimal borders
- Active state for selected filters: gradient background

**Visual Effects**:
- Glassmorphism: backdrop-filter blur(8px) saturate(120%)
- Gradients: emerald (#6ee7b7) to blue (#60a5fa) for accents
- Shadows: Multi-layered with deep opacity for depth
- Highlight effect: yellow gradient background for search matches

**Interactive Elements**:
- Buttons: gradient background, medium padding, rounded-10px
- Hover animations: subtle lift with shadow enhancement (0.18s ease)
- Tag toggles: change to gradient when active

**Logo/Branding**:
- Square logo (64x64px) with gradient background
- Rounded corners (12px)
- Centered initials with inset shadow for depth

### Animations
Use sparingly - only hover lift animations (translateY -6px) on result cards with 0.18s ease timing.

## Accessibility
- ARIA labels on search input and results container
- ARIA live region for dynamic result updates
- Semantic HTML structure
- Keyboard navigation support for suggestions

## Images
No hero images or decorative imagery needed - this is a utility-focused search interface. Focus on functional UI elements and data presentation.

## Theme Architecture
Dark theme with:
- Deep navy backgrounds (#0f1724, #0b1220)
- Muted text (#9aa4b2)
- Gradient accents for primary actions
- Radial gradient overlays for subtle depth
- Glass effects throughout for modern aesthetic