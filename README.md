# tanstack-poc-text-editor

POC เปรียบเทียบ rich-text editor 4 ตัว ได้แก่ **Plate, BlockNote, Lexical และ Tiptap** บน **TanStack Start** โดยใช้ theme ของ **Boonmee Lab Design System**

ทุกหน้า editor โหลดเอกสารตัวอย่างไทย/อังกฤษชุดเดียวกัน และวัดด้วย feature checklist ชุดเดียวกัน ฝั่งซ้ายเป็น editor ฝั่งขวาเป็น preview ที่อัปเดตทันที แสดงได้ 5 แบบ: Rendered, Filled (เติมค่าตัวแปรแล้ว), Markdown, HTML และ JSON

| หน้า | เนื้อหา |
| --- | --- |
| `/` | ภาพรวม, ตาราง feature checklist, สิ่งที่พบระหว่างลงมือสร้าง และขนาด JS ของแต่ละ route |
| `/research` | Research จาก docs, GitHub และ npm: feature, ข้อดี, ข้อเสีย, ข้อจำกัด และแหล่งอ้างอิง |
| `/plate` `/blocknote` `/lexical` `/tiptap` | หน้า editor แต่ละตัว: rich text, slash menu, drag handle, @mention, `{{variable}}`, import/export Markdown และปุ่ม Round-trip |

## เริ่มต้นใช้งาน

ต้องใช้ Node ≥ 22.12 และ pnpm 10

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

| คำสั่ง | ใช้ทำอะไร |
| --- | --- |
| `pnpm verify` | Biome + typecheck + Vitest (ชุดเดียวกับที่ CI รัน) |
| `pnpm e2e` | Playwright (เปิด `pnpm dev` ให้เอง) |
| `pnpm check:fix` | format และ lint autofix ด้วย Biome |
| `pnpm bundle-sizes` | build แล้ววัดขนาด JS ของแต่ละ editor route เขียนผลลงใน `src/data/bundle-sizes.ts` |
| `pnpm run deploy` | build แล้ว `wrangler deploy` ขึ้น Cloudflare Workers (ห้ามใช้ `pnpm deploy` เพราะเป็นคำสั่ง built-in ของ pnpm) |

Git hooks (lefthook) ติดตั้งให้อัตโนมัติตอน `pnpm install`:
- **pre-commit:** Biome และ typecheck
- **pre-push:** Vitest

## ข้อตกลงร่วมของทุก editor

| | Markdown | HTML |
| --- | --- | --- |
| ตัวแปร | `{{customer_name}}` | `<span data-type="variable" data-name="customer_name">` |
| Mention | `[@สมชาย ใจดี](mention:u1)` | `<span data-type="mention" data-id="u1">` |

editor ทุกตัวต้อง import และ export ตามรูปแบบนี้ จึงจะใช้เอกสารตัวอย่างไฟล์เดียวกันและเทียบผล Round-trip ได้ (ดู [ADR-0002](docs/adr/0002-shared-markdown-conventions-for-variables-and-mentions.md))

- **ข้อมูลเอกสาร:** เก็บใน localStorage แยกตาม editor
- **รูปภาพ:** แปลงเป็น base64 จำกัดไม่เกิน 1 MB ([ADR-0004](docs/adr/0004-no-backend-localstorage-and-base64-images.md))
- **นอกขอบเขต:** real-time collaboration, AI และฟีเจอร์ที่ต้องจ่ายเงิน ([ADR-0005](docs/adr/0005-scope-excludes-collaboration-ai-and-paid-features.md))

## โครงสร้าง

```
src/
  routes/            # /, /research, /plate, /blocknote, /lexical, /tiptap
  editors/<id>/      # index.tsx (Editor + Rendered), meta.ts (แถวในตารางเปรียบเทียบ)
  editors/<id>/{ui,components,hooks,lib}   # โค้ดที่ vendor มาจาก registry (Plate UI, shadcn-editor)
  components/        # EditorPage, PreviewPanel, shadcn ui ของแอป
  lib/conventions.ts # รูปแบบ variable/mention ที่ทุก editor ใช้ร่วมกัน
  data/              # sample.md, users, variables, features, research, bundle-sizes
  styles/bml-tokens.css  # token ของ Boonmee Lab (prefix --bml-)
docs/adr/            # บันทึกการตัดสินใจ (ADR)
GLOSSARY.md          # คำศัพท์ของโปรเจกต์
```

## Design system

นำ token มาจาก artifact "Boonmee Lab Design System" (อัปเดตล่าสุด 2026-09-19) แล้ว map เข้า shadcn ใน `src/styles.css`

- **สี:** primary = magenta `#ed2e7c`, secondary = navy `#2c378d`
- **มุม:** radius 2–8px (มุมค่อนข้างคม)
- **Font:** Poppins, Work Sans, Montserrat และ Anuphan (ภาษาไทย)
- **Theme:** light อย่างเดียว เพราะ DS ไม่มี dark theme ([ADR-0007](docs/adr/0007-light-only-boonmee-lab-theme.md))

## Deploy (Cloudflare Workers)

GitHub Actions จะ deploy อัตโนมัติเมื่อ push เข้า `main` ต้องตั้ง repository secrets ก่อน:

- `CLOUDFLARE_API_TOKEN` ต้องมีสิทธิ์ Workers Scripts:Edit
- `CLOUDFLARE_ACCOUNT_ID`

ถ้ายังไม่มี secret ทั้งสองตัว job deploy จะข้ามไปเฉยๆ CI ไม่แดง ชื่อ Worker คือ `tanstack-poc-text-editor` (ตั้งไว้ใน `wrangler.jsonc`)

## Agent skills

skill ทั้งหมด vendor ไว้ใน `.agents/skills/` ติดตั้งด้วย [`skills` CLI](https://github.com/vercel-labs/skills) และมี symlink ไปที่ `.claude/skills/` ส่วน `skills-lock.json` บันทึก source และ hash ของแต่ละ skill

| แหล่ง | Skills |
| --- | --- |
| [mattpocock/skills](https://github.com/mattpocock/skills) | 27 ตัว (`grill-with-docs`, `grilling`, `to-spec`, `tdd`, `triage`, `wayfinder`, …) |
| [michael-denyer/pstack-claude](https://github.com/michael-denyer/pstack-claude) | 55 ตัว (`poteto-mode`, `architect`, `principle-*`, …) ไม่รวม `tdd` และ `teach` ที่ชื่อซ้ำกับของ mattpocock |

- **ไม่ได้ติดตั้ง SessionStart hook และ agent ของ pstack:** ตั้งใจไม่ติดตั้งตาม [ADR-0006](docs/adr/0006-vendor-agent-skills-with-the-skills-cli.md)
- **Cursor:** อ่าน `.agents/skills/` ได้โดยตรง ถ้าต้องการ agent ของ pstack ใน Cursor ให้รัน `/add-plugin pstack` ([cursor/plugins/pstack](https://github.com/cursor/plugins/tree/main/pstack))
- **การตั้งค่าของ mattpocock skills:** อยู่ใน `docs/agents/` (issue tracker คือ GitHub Issues)

```bash
npx skills update             # อัปเดต skill ตาม lock file
npx skills experimental_install   # ติดตั้งใหม่จาก skills-lock.json
```

## เช็คลิสต์ทดสอบด้วยมือ (Thai IME)

Playwright จำลองการพิมพ์ผ่าน IME จริงไม่ได้ ให้ทดสอบเองในแต่ละ editor:

- [ ] พิมพ์ภาษาไทยด้วย keyboard ไทย (macOS และ Windows) ให้มีสระบน/ล่าง และวรรณยุกต์ซ้อน เช่น "น้ำ ผู้ใหญ่ กุ้ง"
- [ ] วางเคอร์เซอร์ระหว่างสระกับพยัญชนะ แล้วกด Backspace หรือ Delete
- [ ] ทดสอบบนมือถือ (iOS Safari และ Android Chrome) ทั้งการพิมพ์ไทยและการลาก block
- [ ] พิมพ์ `@` และ `{{` ต่อท้ายคำภาษาไทยทันทีโดยไม่เว้นวรรค
