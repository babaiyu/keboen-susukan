// Self-hosted variable font: bundled locally so the app keeps its typography
// offline instead of depending on the Google Fonts CDN (PRD NFR: offline-first).
import '@fontsource-variable/plus-jakarta-sans';

import { createRoot } from 'react-dom/client';

import App from './App';

// Ask the browser to keep IndexedDB data from being evicted under storage
// pressure (PRD §10). Best-effort: browsers may decline without user action.
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  void navigator.storage.persist().catch(() => undefined);
}

const container = document.getElementById('root');
const root = createRoot(container!);

// React StrictMode is intentionally omitted: its development-only double
// mounting can fire Ionic lifecycle/router events twice and duplicate
// navigation stack entries. See Ionic React "Lifecycle" docs.
root.render(<App />);
