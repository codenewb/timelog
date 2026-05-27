# Forest Green Theme Design

## Goal

Convert the time scheduler dashboard from a neutral grayscale theme to a calm
forest green theme while preserving its layout, content, interaction behavior,
and component architecture.

## Visual Direction

The interface will use a light, quiet forest palette suited to a planning
workspace: a warm sage-tinted page background, near-white green-tinted card
surfaces, deep forest green primary actions and selected states, and soft sage
secondary and hover surfaces.

## Implementation Boundary

The theme is already expressed through semantic CSS variables in
`src/index.css`, and the application components consume those variables through
Tailwind utility classes. The implementation will update the global light theme
tokens rather than add component-specific color classes.

Tokens in scope:

- Background, foreground, card, and popover surfaces
- Primary action and selected-state colors
- Secondary, muted, and accent surfaces and matching foregrounds
- Border, input, and focus ring colors

The destructive token remains red so that error and destructive states keep
their established semantic meaning.

## Affected Experience

The token update will carry through existing surfaces and controls, including:

- The page canvas and heading text
- Cards and form controls
- Buttons, badges, and hover/focus states
- Calendar selection and recorded-session visualization

No new UI elements, motion, typography, spacing, layout changes, dark theme, or
feature behavior changes are included.

## Accessibility And Validation

The deep forest primary color will be paired with a light foreground for clear
button and selected-state contrast. Body and muted text will remain dark enough
against the pale surfaces, and the focus ring will remain visible on both page
and card backgrounds.

Validation will consist of running the existing test/build checks and performing
a single visual review of the application if available in the local toolchain.
