# tanstack-poc-text-editor

POC comparing four React rich-text editors (Plate, BlockNote, Lexical, Tiptap) on TanStack Start, themed with the Boonmee Lab design system. Read `GLOSSARY.md` and `docs/adr/` before changing behaviour.

## Commands

- `pnpm dev` — dev server on :3000 (Cloudflare workerd runtime via `@cloudflare/vite-plugin`)
- `pnpm verify` — Biome check + typecheck + Vitest (what CI and the git hooks run)
- `pnpm e2e` — Playwright against `pnpm dev`; in cloud sessions set `PLAYWRIGHT_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`
- `pnpm build` / `pnpm run deploy` (not `pnpm deploy`, which is a pnpm built-in) — Worker build / `wrangler deploy`
- `pnpm check:fix` — Biome format + lint autofix

## Layout

- `src/routes/` — `/` overview + comparison, `/research`, and one route per editor
- `src/editors/<id>/` — `index.tsx` exports an `EditorModule` (`meta`, `Editor`, `Rendered`); `meta.ts` holds the comparison row. Contract: `src/editors/types.ts`
- `src/editors/<id>/{ui,components,hooks,lib}` — vendored registry code (Plate UI, shadcn-editor). Excluded from Biome. Edit it only when you have to, and say so in the commit
- `src/components/` — app shell, `EditorPage`, `PreviewPanel`, app-level shadcn `ui/`
- `src/lib/conventions.ts` — the shared variable/mention markdown + HTML forms (ADR-0002)
- `src/data/` — sample document, users, variables, feature checklist, research data

## Conventions

- Biome: tabs, double quotes. Imports use the `@/` alias (not `#/`; shadcn CLI mishandles `#`).
- After any `shadcn add`, replace `from "cn"` with `from "@/lib/utils"` and remove the `cn` package (ADR-0003).
- Light theme only; use semantic Tailwind tokens (`bg-primary`, `text-primary-text`, `bg-muted`), never raw hex.
- Editors must stay client-only (`<ClientOnly>`); route modules are imported on the server, so no top-level `window` access.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
