import { en } from "@blocknote/core/locales";

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

export const th: typeof en = {
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
};

export const dictionaries = { en, th } as const;
export type UiLanguage = keyof typeof dictionaries;

/** Labels for our own slash items / groups, per UI language. */
export const customLabels: Record<
	UiLanguage,
	{
		group: string;
		variable: { title: string; subtext: string };
		mention: { title: string; subtext: string };
	}
> = {
	en: {
		group: "Template",
		variable: {
			title: "Variable",
			subtext: "Insert a {{variable}} chip (or type {{)",
		},
		mention: { title: "Mention", subtext: "Mention a person (or type @)" },
	},
	th: {
		group: "เทมเพลต",
		variable: { title: "ตัวแปร", subtext: "แทรกตัวแปร {{variable}} (หรือพิมพ์ {{)" },
		mention: { title: "กล่าวถึง", subtext: "กล่าวถึงบุคคล (หรือพิมพ์ @)" },
	},
};
