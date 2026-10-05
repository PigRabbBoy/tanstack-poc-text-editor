# Each editor's UI is vendored into its own folder; Tiptap's is hand-built

Plate (shadcn registry) and Lexical (community `shadcn-editor` registry) copy their own `button`, `popover`, `dropdown-menu` etc. into `src/editors/<id>/ui`, generated with a per-editor `components.json` alias, instead of sharing `src/components/ui`. The registries ship different variants and primitives (Plate uses Radix; `shadcn-editor` needs the base-ui `base-nova` style), so sharing would make one editor overwrite another's components. BlockNote uses `@blocknote/shadcn`. Tiptap's official UI components are SCSS or paid, so its UI is built with the app's own shadcn components. The duplication is deliberate: it shows what adopting each editor really costs.

## Consequences

- Vendored folders (`src/editors/*/{ui,components,hooks,lib}`) are excluded from Biome. They are still typechecked.
- shadcn CLI 4.21 rewrites the utils import to a bogus `cn` npm package. After any `shadcn add`, replace `from "cn"` with `from "@/lib/utils"` and remove the `cn` dependency.
