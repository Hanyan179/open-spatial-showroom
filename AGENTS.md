# Working on Open Spatial Showroom

This repository is a generic, public 3D showroom template. Read this file before making changes. The user's current request determines scope; do not publish, push, change visibility or add private content without authorization.

## Start with the affected module

- `src/App.jsx`: thin application entry.
- `src/spatial/core/`: scene definitions, registry, actions, navigation state, product category mappings and motion mathematics. No React or engine dependencies here.
- `src/spatial/scenes/` and `regional-journeys.js`: room identity, views, physical areas, content actions and tour order.
- `src/spatial/host/`: one owner for navigation, language, overlays, visit memory, tour and presenter control.
- `src/spatial/engine/create-spatial-engine.js`: rendering, input, camera transitions and scene lifecycle.
- `src/spatial/scene-models/`: build-time procedural model factories. Never import them into the browser entry.
- `src/spatial/ui/`: directory, controls, content shell and responsive layout.
- `resource-client.js`, `room-products.js`, `company-life.js`: runtime content adapters; keep endpoints out of UI components.
- `vendor/explorer/`: editable, repository-owned product explorer module; its host bridge preserves media and navigation state.
- `public/data/`, `public/showroom.config.json`: public content. `public/modules/product-explorer/` and `public/models/scenes/` are generated; edit their sources instead.

See `docs/ARCHITECTURE.md` and `docs/CONTENT.md` only as needed. Do not read unrelated history or start an architectural rewrite for a small fix.

## Architectural contracts

1. `SceneDefinition` is the shared core entity. Register it in `core/scene-registry.js`; the directory, tour, loading and resource export derive from that registry. Do not create competing room lists.
2. A point has a real position, safe camera view and action. Content and navigation must agree about its room. More than three points per room are allowed; at most three visible, unobstructed primary pins appear per view.
3. Actions are validated by `core/action-contracts.js` and resolved by `core/action-router.js`. New action types need a handler, content contract, renderer and focused tests.
4. The host owns autoplay and user takeover. Do not add a second timer in a content module. Keep explorer mounted; preserve category, selected item, scroll and media state on return.
5. Room changes use safe paths and shared transitions. Do not teleport cameras through furniture or walls. Cross-region flight uses globe-relative heading, and local journeys do not fly.
6. Put mechanical rules in pure motion functions; retain animated groups and click metadata during batching and GLB export. Fixed furniture should not float or rotate for decoration.
7. UI text uses the existing bilingual convention (`{zh,en}` in feeds or `[zh,en]` in scene definitions). Stable IDs and routes are never translated. Preserve logo aspect ratio if a downstream user configures one; ship no default corporate mark.
8. Keep content and credentials separate. Runtime JSON endpoints may be local or remote; never put access tokens in committed front-end assets.
9. Use current dependencies when possible. No speculative service layer, database or framework migration without a concrete requirement.

## Commands and generated files

Use Node.js >=22.12.0 and `npm ci`. Development is on port 5217; built preview on 5218, loopback by default. Do not terminate another project's port without identifying the process.

- UI/host edits: `npm run build`, relevant tests, browser interaction check.
- Scene geometry, physical signs, year sculptures or partner mounts: `npm run build:scenes`, then build. Commit regenerated GLBs and manifest.
- Explorer content or code: `npm run build:explorer`, then build. Commit regenerated `public/modules/product-explorer/`.
- Demo illustration generator: `npm run build:media`; this overwrites generated sample SVGs. Put custom media in a separate directory.
- Release: `npm run build:all`, `npm test`, `npm run check:public`, `npm audit --omit=dev`, and targeted browser verification.

The asset and architecture checks are necessary, not proof of visual quality. Check the affected view and continuous interaction, not only a screenshot. For layout changes check 2496×1248 and a smaller desktop viewport. Report measured results and device limits accurately. Do not run hour-long or repeated soak tests unless specifically requested or needed to investigate a reproduced problem.

## Public-data and documentation rules

- Preserve unrelated changes. Do not overwrite a user's configured data with demos just to pass a test.
- Default repository content is fictional and unbranded. Do not infer ownership from a brand archive or associate products with a brand without explicit data.
- Do not add private customer data, source spreadsheets, third-party screenshots, credentials, absolute personal paths or deployment-specific network addresses.
- Every new asset needs a provenance and redistribution check; record third-party licenses in `THIRD_PARTY_NOTICES.md`.
- Update the relevant maintenance document if a schema, command or extension contract changes. `README.md` explains the product and setup, not a chronological work log.
- Do not promise one-line integration for a feature that needs a new model, path or action handler. State which configuration-only cases really work.

## Example bounded tasks

“Add one image-only beauty product to the existing bath category. Keep the room model and tour unchanged; validate its category, detail and return flow.”

“Add one room following SceneDefinition. Implement its model factory, physical viewpoints and safe path; register it once, rebuild its resources and verify directory, tour, content and return.”

“Fix a control overlapping an exhibit at 1920×1080 and 2496×1248. Preserve hidden-tour presentation and touch target sizes. Capture the changed view and verify takeover.”
