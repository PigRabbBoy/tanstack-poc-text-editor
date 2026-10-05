import {
	ar,
	de,
	en,
	es,
	fa,
	fr,
	he,
	hr,
	is,
	it,
	ja,
	ko,
	nl,
	no,
	pl,
	pt,
	ru,
	sk,
	uk,
	uz,
	vi,
	zh,
	zhTW,
} from "@blocknote/core/locales";
import { locales as diagram } from "@blocknote/diagram-block";
import { locales as math } from "@blocknote/math-block";
import { locales as multiColumn } from "@blocknote/xl-multi-column";

const core = {
	ar,
	de,
	en,
	es,
	fa,
	fr,
	he,
	hr,
	is,
	it,
	ja,
	ko,
	nl,
	no,
	pl,
	pt,
	ru,
	sk,
	uk,
	uz,
	vi,
	zh,
	zhTW,
} as Record<string, typeof en>;

/**
 * BlockNote ships ~23 UI dictionaries but no Thai one. A dictionary is a plain object,
 * so a partial Thai override is just a spread of `en` with the strings we care about.
 * English aliases are kept so `/h1`, `/table`… still work while the UI is in Thai.
 */
type SlashKey = keyof typeof en.slash_menu;

const slash: Partial<
	Record<SlashKey, { title: string; subtext: string; group: string }>
> = {
	heading: { title: "หัวข้อ 1", subtext: "หัวข้อระดับบนสุด", group: "หัวข้อ" },
	heading_2: { title: "หัวข้อ 2", subtext: "หัวข้อส่วนหลัก", group: "หัวข้อ" },
	heading_3: { title: "หัวข้อ 3", subtext: "หัวข้อย่อย", group: "หัวข้อ" },
	heading_4: { title: "หัวข้อ 4", subtext: "หัวข้อย่อยเล็ก", group: "หัวข้อย่อย" },
	heading_5: { title: "หัวข้อ 5", subtext: "หัวข้อย่อยเล็ก", group: "หัวข้อย่อย" },
	heading_6: { title: "หัวข้อ 6", subtext: "หัวข้อย่อยเล็กสุด", group: "หัวข้อย่อย" },
	toggle_heading: {
		title: "หัวข้อพับได้ 1",
		subtext: "หัวข้อที่ซ่อน/แสดงเนื้อหาได้",
		group: "หัวข้อย่อย",
	},
	toggle_heading_2: {
		title: "หัวข้อพับได้ 2",
		subtext: "หัวข้อที่ซ่อน/แสดงเนื้อหาได้",
		group: "หัวข้อย่อย",
	},
	toggle_heading_3: {
		title: "หัวข้อพับได้ 3",
		subtext: "หัวข้อที่ซ่อน/แสดงเนื้อหาได้",
		group: "หัวข้อย่อย",
	},
	quote: { title: "คำพูด", subtext: "ข้อความอ้างอิง", group: "บล็อกพื้นฐาน" },
	toggle_list: {
		title: "รายการพับได้",
		subtext: "รายการที่ซ่อนรายการย่อยได้",
		group: "บล็อกพื้นฐาน",
	},
	numbered_list: {
		title: "รายการลำดับเลข",
		subtext: "รายการเรียงลำดับ",
		group: "บล็อกพื้นฐาน",
	},
	bullet_list: {
		title: "รายการหัวข้อย่อย",
		subtext: "รายการไม่เรียงลำดับ",
		group: "บล็อกพื้นฐาน",
	},
	check_list: {
		title: "รายการตรวจสอบ",
		subtext: "รายการพร้อมช่องติ๊ก",
		group: "บล็อกพื้นฐาน",
	},
	paragraph: { title: "ย่อหน้า", subtext: "เนื้อหาปกติ", group: "บล็อกพื้นฐาน" },
	code_block: { title: "โค้ด", subtext: "บล็อกโค้ด", group: "บล็อกพื้นฐาน" },
	divider: { title: "เส้นคั่น", subtext: "แบ่งส่วนเนื้อหา", group: "บล็อกพื้นฐาน" },
	page_break: { title: "ขึ้นหน้าใหม่", subtext: "ตัวแบ่งหน้า", group: "ขั้นสูง" },
	table: { title: "ตาราง", subtext: "ตารางแก้ไขได้", group: "ขั้นสูง" },
	image: { title: "รูปภาพ", subtext: "รูปภาพพร้อมคำบรรยาย", group: "สื่อ" },
	video: { title: "วิดีโอ", subtext: "วิดีโอพร้อมคำบรรยาย", group: "สื่อ" },
	audio: { title: "เสียง", subtext: "ไฟล์เสียงพร้อมคำบรรยาย", group: "สื่อ" },
	file: { title: "ไฟล์", subtext: "แนบไฟล์", group: "สื่อ" },
	emoji: { title: "อีโมจิ", subtext: "ค้นหาและแทรกอีโมจิ", group: "อื่น ๆ" },
};

const slashMenu = Object.fromEntries(
	Object.entries(en.slash_menu).map(([key, item]) => {
		const thai = slash[key as SlashKey];
		return [
			key,
			thai
				? { ...item, ...thai, aliases: [...item.aliases, thai.title] }
				: item,
		];
	}),
) as typeof en.slash_menu;

const th: typeof en = {
	...en,
	slash_menu: slashMenu,
	placeholders: {
		...en.placeholders,
		default: "พิมพ์ข้อความ หรือพิมพ์ '/' เพื่อเรียกคำสั่ง",
		heading: "หัวข้อ",
		bulletListItem: "รายการ",
		numberedListItem: "รายการ",
		checkListItem: "รายการ",
		toggleListItem: "พับได้",
	},
	side_menu: { add_block_label: "เพิ่มบล็อก", drag_handle_label: "เมนูบล็อก" },
	drag_handle: {
		...en.drag_handle,
		delete_menuitem: "ลบ",
		colors_menuitem: "สี",
		header_row_menuitem: "แถวหัวตาราง",
		header_column_menuitem: "คอลัมน์หัวตาราง",
	},
	table_handle: {
		...en.table_handle,
		delete_column_menuitem: "ลบคอลัมน์",
		delete_row_menuitem: "ลบแถว",
		add_left_menuitem: "เพิ่มคอลัมน์ทางซ้าย",
		add_right_menuitem: "เพิ่มคอลัมน์ทางขวา",
		add_above_menuitem: "เพิ่มแถวด้านบน",
		add_below_menuitem: "เพิ่มแถวด้านล่าง",
		split_cell_menuitem: "แยกเซลล์",
		merge_cells_menuitem: "รวมเซลล์",
		background_color_menuitem: "สีพื้นหลัง",
	},
	suggestion_menu: { no_items_title: "ไม่พบรายการ" },
	color_picker: {
		...en.color_picker,
		text_title: "ข้อความ",
		background_title: "พื้นหลัง",
	},
	comments: {
		...en.comments,
		save_button_text: "บันทึก",
		cancel_button_text: "ยกเลิก",
	},
};

/** Every UI language on this page: BlockNote's own locales plus our Thai override. */
export const LANGUAGES = [
	{ id: "en", label: "English" },
	{ id: "th", label: "ไทย (custom)" },
	{ id: "ar", label: "العربية" },
	{ id: "de", label: "Deutsch" },
	{ id: "es", label: "Español" },
	{ id: "fa", label: "فارسی" },
	{ id: "fr", label: "Français" },
	{ id: "he", label: "עברית" },
	{ id: "hr", label: "Hrvatski" },
	{ id: "is", label: "Íslenska" },
	{ id: "it", label: "Italiano" },
	{ id: "ja", label: "日本語" },
	{ id: "ko", label: "한국어" },
	{ id: "nl", label: "Nederlands" },
	{ id: "no", label: "Norsk" },
	{ id: "pl", label: "Polski" },
	{ id: "pt", label: "Português" },
	{ id: "ru", label: "Русский" },
	{ id: "sk", label: "Slovenčina" },
	{ id: "uk", label: "Українська" },
	{ id: "uz", label: "Oʻzbek" },
	{ id: "vi", label: "Tiếng Việt" },
	{ id: "zh", label: "简体中文" },
	{ id: "zhTW", label: "繁體中文" },
] as const;

export type UiLanguage = (typeof LANGUAGES)[number]["id"];

function pick<T>(table: Record<string, T>, id: string, fallback: T): T {
	return table[id] ?? fallback;
}

/**
 * The editor dictionary for one UI language. The optional block packages read their
 * strings from their own keys (`multi_column`, `math`, `diagram`); a missing locale
 * falls back to English. Thai only overrides core strings, so its package strings are
 * English.
 */
export function dictionaryFor(language: UiLanguage) {
	const base = language === "th" ? th : (core[language] ?? en);
	const packageLanguage = language === "th" ? "en" : language;
	return {
		...base,
		multi_column: pick<typeof multiColumn.en>(
			multiColumn,
			packageLanguage,
			multiColumn.en,
		),
		math: pick<typeof math.en>(math, packageLanguage, math.en),
		diagram: pick<typeof diagram.en>(diagram, packageLanguage, diagram.en),
	};
}

/** Labels for our own slash items / groups, per UI language (non-Thai fall back to English). */
const customLabelTable = {
	en: {
		group: "Template",
		variable: {
			title: "Variable",
			subtext: "Insert a {{variable}} chip (or type {{)",
		},
		mention: { title: "Mention", subtext: "Mention a person (or type @)" },
		alert: {
			title: "Alert",
			subtext: "Warning, error, info or success callout",
		},
	},
	th: {
		group: "เทมเพลต",
		variable: { title: "ตัวแปร", subtext: "แทรกตัวแปร {{variable}} (หรือพิมพ์ {{)" },
		mention: { title: "กล่าวถึง", subtext: "กล่าวถึงบุคคล (หรือพิมพ์ @)" },
		alert: { title: "กล่องแจ้งเตือน", subtext: "คำเตือน ข้อผิดพลาด ข้อมูล หรือสำเร็จ" },
	},
};

export function customLabels(language: UiLanguage) {
	return language === "th" ? customLabelTable.th : customLabelTable.en;
}
