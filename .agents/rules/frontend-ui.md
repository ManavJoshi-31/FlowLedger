---
name: frontend-ui
description: Enforces frontend engineering standards, design token discipline, component reuse, and API integrity for FlowLedger UI and styling tasks.
trigger: model_decision
---

# Frontend UI Engineering Rules — FlowLedger

These rules apply whenever designing, modifying, or refactoring UI components, pages, layouts, and stylesheets in `frontend/`.

---

## 1. Pre-Implementation Inspection

1. **Inspect Before Touching:** Before creating or editing any component or stylesheet, inspect the target file, its co-located styles, and parent view.
2. **Consult Design & Engineering Standards:** Always review [docs/DESIGN_SYSTEM.md](file:///c:/Users/manav/FlowLedger/docs/DESIGN_SYSTEM.md) and [docs/FRONTEND_GUIDE.md](file:///c:/Users/manav/FlowLedger/docs/FRONTEND_GUIDE.md) before applying stylistic changes.
3. **Verify Service Contracts:** Inspect the relevant service file in `frontend/src/services/` to understand exact payload structures, status codes, and data normalizations.

---

## 2. Design Token & Styling Discipline

1. **Strict Vanilla CSS with Custom Properties:** Use pure CSS custom properties defined in [frontend/src/index.css](file:///c:/Users/manav/FlowLedger/frontend/src/index.css).
2. **NO Hardcoded Palette Values:** Never introduce arbitrary hex codes, rgb strings, or inline CSS styles for elements covered by standard design tokens:
   - Primary accents: `var(--color-teal)`, `var(--color-slate)`
   - Surfaces: `var(--color-surface)`, `var(--color-ivory)`, `var(--color-surface-subtle)`
   - Borders: `var(--color-border)`, `var(--color-border-subtle)`
   - Radii: `var(--radius-xs)`, `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-pill)`
3. **NO Tailwind CSS or External CSS Libraries:** Do not install or introduce Tailwind CSS, Bootstrap, Material UI, or other component libraries unless explicitly mandated by the user.
4. **Co-Located Stylesheets:** Maintain co-located stylesheets for components (`ComponentName.jsx` and `ComponentName.css`) and export through `index.js`.

---

## 3. Business Logic, RBAC & API Integrity

1. **Preserve Working Service Calls:** Never replace existing backend service invocations in `frontend/src/services/` with mock objects, synthetic delays, or local demo arrays.
2. **Preserve Role-Based Guards:** Retain all `ProtectedRoute` role permissions, conditional button visibilities, and navigation restrictions.
3. **Normalize Monetary Amounts:** Always route monetary figures from budgets or requests through `normalizeBudget` or `normalizeRequest` before rendering to handle Mongoose `Decimal128` structures.
4. **Defensive Form Constraints:** Ensure financial inputs validate for positive whole numbers and required fields before triggering API calls.

---

## 4. Stitch MCP Design Translation

When adapting screen designs from Stitch MCP:
1. **Extract Aesthetics Only:** Translate layout, typography hierarchy, and spacing into clean React JSX and Vanilla CSS.
2. **Map to Predefined Tokens:** Convert Stitch hex values to FlowLedger design tokens.
3. **Wire to Existing State & Services:** Bind forms, buttons, and tables to verified application logic and AuthContext.

---

## 5. Incremental Delivery & Verification

1. **Atomic Refactoring:** Modify one component or page at a time. Avoid sweeping multi-file rewrites.
2. **State & Error Verification:** Always verify that loading indicators (`.loading-indicator`), empty states (`.state-box`), and error alerts (`.alert.alert-error`) function properly.
3. **Task Completion Summary:** Every UI response must summarize:
   - Modified and created files.
   - Design tokens and component patterns utilized.
   - Verified role behaviors and test scenarios.
   - Any outstanding limitations or pending items.
