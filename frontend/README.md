# Frontend

React + Vite ingredient extraction interface. See the root README for full setup.

```powershell
npm ci
npm run dev
```

- `/#/`: automatic pipeline walkthrough.
- `/#/extract`: upload, labelled output, ingredients/API/custom responses.

```powershell
npm run build
npm run lint
npm test
```

Pages own their styles and page-specific components. Shared controls and layout
live under `src/components`. Hooks own asynchronous state and lifecycle. Services
handle HTTP, image reading, annotation, and response normalization without JSX.
Tests use Node's test runner and JSDOM; no browser or Groq key is needed.
