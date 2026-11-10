# Frontend design system

## Direction

A professional consumer utility with a light, consistent surface system. The visual direction follows the high-end visual design skill's soft structuralism and editorial split, adapted to a functional extraction workspace. This is a custom design system, not an official Google or Material implementation.

Design variance: 5/10. Motion intensity: 3/10, apart from the explicitly requested detection animation. Density: 4/10. The interface prioritizes the user's package, extracted ingredients, and conversation. Decorative eyebrows, technology badges, gradients, and repeated instructional copy were removed.

## Foundations

Plus Jakarta Sans is self-hosted through Fontsource with variable weight and `font-display: swap`. Phosphor Light is the application icon family; vendor components retain their packaged icons. The palette uses neutral white and silver surfaces, charcoal text, and a single blue action color. Colors and radii are defined once in `src/styles/theme.js` and used by both CSS and external component props.

The surface primitive creates a six-pixel enclosure around an eighteen-pixel inner radius. Shared buttons use a consistent pill shape. Icon buttons and inputs use the twelve-pixel control radius. The header is a detached surface, not an edge-to-edge sticky bar. The primary CTA has a contained trailing action icon.

Layout uses a 1280px maximum content width, fluid gutters, and an explicit mobile stack below 768px. The upload settings use two columns on wider phones and a centered vertical layout below 480px. Results stack the image and reading panel vertically. Long content scrolls inside its own region. Navigation and feedback remain reachable on small screens.

## Interaction and accessibility

- Visible keyboard focus and a skip link that preserves hash routing.
- Semantic tabs with arrow keys, Home, End, and linked tab panels.
- A native processing dialog with Escape/cancel and retained upload state.
- Input validation and readable, recoverable error states.
- Complete language choices, correct Arabic text direction, and Unicode exports.
- Chat logs with announced additions and sender-specific alignment.
- Reduced motion handled at the application and animation component levels.
- All custom cursor movement uses Motion transforms; zoom/pan uses react-zoom-pan-pinch.
- The image supports zoom buttons, pinch gestures, and Ctrl+scroll. Ordinary wheel scrolling moves the page; dragging pans only after zooming in.
- Cursors are limited to 24 concurrently rendered annotations on unusually dense images; all detected boxes remain represented.

## Maintenance

Page composition stays in the page component. Styles are colocated with the component that owns them. Do not append cross-page corrective CSS. Promote a repeated value into the token system or a repeated control into `components/ui/`. Third-party skinning belongs in `styles/reactbits.css`, not scattered across pages.
