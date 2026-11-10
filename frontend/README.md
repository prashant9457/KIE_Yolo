# Frontend

React 19 + Vite. Run the FastAPI backend separately; Vite proxies API requests to port 8000.

```powershell
npm ci
npm run dev
```

`/#/` explains the product using an explicitly labeled sample. `/#/extract` opens the workspace. The older `/#/workspace` URL remains supported.

## Structure

- `src/styles/theme.js`: canonical palette, radii, animation easing, and third-party component themes. Tokens are applied to the document root and reused in portals.
- `src/styles/tokens.css`: shared typography, spacing, shadows, breakpoints, and layer values.
- `src/styles/base.css`: reset, focus, reduced motion, and global element defaults.
- `src/styles/reactbits.css`: the single theme adapter for vendored React Bits components.
- `src/components/ui/`: reusable buttons, surfaces, notices, and clear confirmation.
- `src/components/layout/`: application navigation, session feedback, and footer.
- `src/pages/`: page composition and colocated component styles.
- `src/hooks/`: requests, cancellation, image geometry, chat scrolling, clipboard state, and navigation.
- `src/services/`: transport, image validation, normalization, translation validation, chat context, and exports. No JSX or application state.
- `src/config/languages.js`: language options shared by the interface and translation validation.
- `src/components/reactbits/`: vendored third-party code and license, excluded from application formatting.

## Behavior

Upload an image or choose the sample, adjust detection confidence, and extract. Cancelling keeps the selected image. The results view pairs a zoomable image with ingredients, six language choices, a label assistant, and optional API output. Motion draws detection boxes using diagonal cursor drags; reduced motion displays the completed boxes directly. Zooming and panning keep boxes attached to the image.

Chat messages have separate sender alignment, readable Markdown, their own scrolling region, and a persistent composer. Network and provider failures appear as chat replies. Ingredient exports follow the selected language. Conversation exports are plain text. Missing translations can be regenerated without rerunning OCR. Likes and ratings are session-only.

## Checks

```powershell
npm test
npm run lint
npm run build
npm run format:check
```

`npm run format` applies the repository's Prettier configuration. Tests use Node and JSDOM with mocked inference/provider calls. Live backend/model accuracy needs separate image testing.

See [design notes](docs/design-system.md) and [sample image provenance](src/assets/README.md).
