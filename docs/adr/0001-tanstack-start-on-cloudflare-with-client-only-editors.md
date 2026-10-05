# TanStack Start on Cloudflare Workers, editors rendered client-only

We build the POC on TanStack Start (still a Release Candidate in Oct 2026) rather than a TanStack Router SPA, because the team's other apps use Start and we want to prove the editors survive SSR. Each editor route still server-renders its layout, header and preview shell, but the editor itself is wrapped in `<ClientOnly>` with a skeleton fallback (all four editors are DOM-bound). Deployment target is Cloudflare Workers via `@cloudflare/vite-plugin`, deployed by GitHub Actions on merge to `main`.

## Considered Options

- `ssr: false` per route: simpler, but proves nothing about Start + editor coexistence.
- TanStack Router SPA: no SSR concerns, but diverges from the stack the POC is meant to de-risk.
