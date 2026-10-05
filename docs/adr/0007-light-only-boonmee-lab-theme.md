# Light-only theme from vendored Boonmee Lab tokens

The Boonmee Lab design system has no dark theme, so the app is light-only and shadcn's semantic variables are mapped onto the DS tokens in `src/styles.css`. The tokens are vendored from the "Boonmee Lab Design System" artifact (2026-09-19) into `src/styles/bml-tokens.css`. Every token is renamed to `--bml-*`, because the DS's `--border`, `--color-primary` and `--radius-*` would otherwise collide with shadcn's and Tailwind's names. Small magenta text uses pink-600 (`text-primary-text`), because pink-500 on white is only about 4:1.
