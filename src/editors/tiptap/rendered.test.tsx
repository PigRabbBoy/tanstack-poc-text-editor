import { render } from "@testing-library/react";
import { Editor } from "@tiptap/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { schemaExtensions } from "./extensions";
import { TiptapRendered } from "./rendered";

function jsonFrom(markdown: string) {
	const editor = new Editor({
		extensions: schemaExtensions(),
		content: markdown,
		contentType: "markdown",
	});
	const json = editor.getJSON();
	editor.destroy();
	return json;
}

afterEach(() => vi.restoreAllMocks());

describe("TiptapRendered", () => {
	it("renders embeds, ruby and captioned images without React prop warnings", () => {
		const errors = vi.spyOn(console, "error").mockImplementation(() => {});
		const json = jsonFrom(
			[
				':::youtube {src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"}',
				":::",
				':::twitch {src="https://www.twitch.tv/videos/1234567890"}',
				":::",
				"<ruby>漢字<rt>かんじ</rt></ruby>",
				'![Logo](https://x.dev/a.png "The caption")',
			].join("\n\n"),
		);
		const { container } = render(<TiptapRendered json={json} />);
		expect(
			container.querySelector("div[data-youtube-video] iframe"),
		).not.toBeNull();
		expect(
			container.querySelector("div[data-twitch-video] iframe"),
		).not.toBeNull();
		expect(container.querySelector("ruby rt")?.textContent).toBe("かんじ");
		expect(container.querySelector("figure figcaption")?.textContent).toBe(
			"The caption",
		);
		expect(errors).not.toHaveBeenCalled();
	});
});
