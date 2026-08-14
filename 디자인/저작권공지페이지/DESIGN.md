---
name: Spring / Vernal Minimal
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#514345'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#837375'
  outline-variant: '#d6c2c4'
  surface-tint: '#864e5a'
  primary: '#6b3743'
  on-primary: '#ffffff'
  primary-container: '#864e5a'
  on-primary-container: '#ffcbd4'
  inverse-primary: '#fbb3c1'
  secondary: '#016e21'
  on-secondary: '#ffffff'
  secondary-container: '#99f899'
  on-secondary-container: '#0f7427'
  tertiary: '#62603d'
  on-tertiary: '#ffffff'
  tertiary-container: '#b0ad84'
  on-tertiary-container: '#424121'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#fbb3c1'
  on-primary-fixed: '#360d18'
  on-primary-fixed-variant: '#6b3743'
  secondary-fixed: '#99f899'
  secondary-fixed-dim: '#7edb7f'
  on-secondary-fixed: '#002105'
  on-secondary-fixed-variant: '#005317'
  tertiary-fixed: '#e8e4b8'
  tertiary-fixed-dim: '#ccc89e'
  on-tertiary-fixed: '#1e1c02'
  on-tertiary-fixed-variant: '#4a4827'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  surface-pink: '#ffb7c5'
  ambient-glow: rgba(255, 183, 197, 0.15)
  lp-shadow: rgba(134, 78, 90, 0.2)
typography:
  display-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Be Vietnam Pro
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Be Vietnam Pro
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
  container-max: 1280px
---

## Brand & Style
The brand identity, "Spring," evokes a sense of renewal, clarity, and organic elegance. It is designed to feel light, airy, and rhythmic, targeting an audience that appreciates curated, high-fidelity audio experiences and minimalist aesthetics.

The visual style is a blend of **Soft Minimalism** and **Glassmorphism**. It prioritizes heavy whitespace, a sophisticated pastel palette, and subtle depth through ambient, color-tinted shadows. The interface should feel like a physical object—specifically a vinyl sleeve or a clean gallery space—where the content (the music) is the central focus. Motion, such as the rotating record, adds a tactile, analog quality to the digital experience.

## Colors
The palette is rooted in a "Fidelity" variant of a soft spring theme. 

- **Primary (#864e5a):** A muted, sophisticated rose-wood used for key brand moments, active states, and primary typography.
- **Surface & Background (#f9f9f9):** A clean, off-white that prevents the starkness of pure white, providing a softer canvas for the pastel accents.
- **Accents:** Secondary greens and tertiary olives are used sparingly for specialized containers or subtle highlights, maintaining the botanical theme.
- **Glassmorphism:** The player bar utilizes a translucent white (`#ffffffcc`) with a heavy backdrop blur (24px+) to create a sense of floating over the content.

## Typography
The system uses two complementary sans-serifs:
- **Be Vietnam Pro** is used for headlines and display text. Its contemporary, geometric construction provides a clean, rhythmic quality.
- **Plus Jakarta Sans** is used for all functional body text and labels. Its slightly wider apertures and friendly terminals ensure high readability at smaller scales.

**Styling Note:** Labels and sub-headers often utilize an "all-caps" style with wide tracking (0.1em) to create a premium, editorial feel.

## Layout & Spacing
The layout follows a **Fixed Grid** approach for the main content column (centered, 1280px max) while utilizing fluid, full-width fixed elements for navigation and player controls.

- **Vertical Rhythm:** A modular scale based on 8px is used. Large sections (like the LP image and tracklist) are separated by `stack-lg` (48px). 
- **The "Canvas" Model:** Content is centered with generous top and bottom padding (up to 128px) to allow for the fixed player bar without obscuring content.
- **Responsive Behavior:** On mobile, margins shrink to 20px, and the central hero image (LP) scales down proportionally. The tracklist rows maintain height for touch-target safety but reduce horizontal padding.

## Elevation & Depth
The system avoids traditional "drop shadows" in favor of **Ambient Glows** and **Tonal Layering**.

- **Level 1 (Submerged):** The main background (`#f9f9f9`) serves as the base.
- **Level 2 (Float):** Interactive items like track cards use a subtle white background and an ambient pink-tinted shadow (`0px 10px 30px rgba(255, 183, 197, 0.15)`) upon hover.
- **Level 3 (Object):** Primary visual objects like the LP record use a deeper, rose-tinted shadow (`0px 20px 50px rgba(134, 78, 90, 0.2)`) to give them physical weight.
- **Level 4 (Overlay):** The persistent player bar uses a backdrop-filter (blur) to create a semi-opaque layer that floats above the entire application.

## Shapes
The shape language is primarily rounded, reflecting the organic theme of "Spring."

- **Standard Containers:** Cards and list items use a 12px (`0.75rem` / `rounded-xl`) corner radius.
- **Interactive Elements:** Buttons and progress bars use fully rounded caps (pill-shaped).
- **Iconic Shapes:** Large hero elements, like the album art, should be rendered as perfect circles (`rounded-full`) to emphasize the vinyl metaphor.

## Components
- **List Items (Tracks):** Transparent background by default. On hover, transition to white with an `ambient-glow` shadow and a subtle `surface-variant` border. Active tracks use the `primary` color for text and icons.
- **Player Bar:** A fixed-bottom container with a 20px height and 24px horizontal padding. Includes a progress bar with a secondary track and primary-colored fill.
- **Icons:** Use **Material Symbols Outlined**. Standard weight, 20px for list items, 24-40px for playback controls. Utilize `FILL` settings for active states (e.g., play vs pause).
- **Progress Bars:** Minimalist 4px height. The "track" is `surface-variant`, and the "progress" is the `primary` color.
- **Buttons:** Playback buttons are icon-only with a slight scale transform (1.05x) on hover.