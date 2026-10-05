import type { Value } from "platejs";
import { useMemo } from "react";
import { EditorStatic } from "@/editors/plate/ui/editor-static";
import type { RenderedProps } from "@/editors/types";
import { createStaticPlateEditor } from "./snapshot";

/** Read-only render from JSON with Plate's static renderer (`PlateStatic`), no editable. */
export default function PlateRendered({ json }: RenderedProps) {
	const editor = useMemo(
		() => createStaticPlateEditor(Array.isArray(json) ? (json as Value) : []),
		[json],
	);
	return (
		<EditorStatic
			editor={editor}
			variant="none"
			className="cursor-default text-base leading-[1.8]"
			data-testid="plate-static"
		/>
	);
}
