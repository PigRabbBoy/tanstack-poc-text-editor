import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";

/**
 * The "Alert" block from BlockNote's custom-block docs (examples/06-custom-schema/01-alert-block),
 * restyled with BML tokens. The example opens a Mantine menu from the icon; here the icon
 * cycles through the four types so the block has no UI-library dependency.
 */
export const ALERT_TYPES = [
	{
		value: "warning",
		title: "Warning",
		icon: CircleAlert,
		className: "bg-bml-warning/15 text-warning-text",
	},
	{
		value: "error",
		title: "Error",
		icon: CircleX,
		className: "bg-destructive/10 text-destructive",
	},
	{
		value: "info",
		title: "Info",
		icon: Info,
		className: "bg-bml-lavender text-bml-navy",
	},
	{
		value: "success",
		title: "Success",
		icon: CircleCheck,
		className: "bg-bml-success/15 text-success-text",
	},
] as const;

export type AlertType = (typeof ALERT_TYPES)[number]["value"];

export function alertType(value: string) {
	return ALERT_TYPES.find((type) => type.value === value) ?? ALERT_TYPES[0];
}

export const Alert = createReactBlockSpec(
	{
		type: "alert",
		propSchema: {
			textAlignment: defaultProps.textAlignment,
			textColor: defaultProps.textColor,
			type: {
				default: "warning",
				values: ["warning", "error", "info", "success"],
			},
		},
		content: "inline",
	},
	{
		render: ({ block, editor, contentRef }) => {
			const current = alertType(block.props.type);
			const Icon = current.icon;
			const next =
				ALERT_TYPES[
					(ALERT_TYPES.findIndex((type) => type.value === current.value) + 1) %
						ALERT_TYPES.length
				];
			return (
				<div
					className={`flex min-h-12 w-full items-center gap-3 rounded-md px-3 py-2 ${current.className}`}
					data-alert-type={current.value}
				>
					<button
						type="button"
						contentEditable={false}
						className="shrink-0 cursor-pointer disabled:cursor-default"
						title={`${current.title} — click for ${next.title}`}
						aria-label={`Alert type: ${current.title}`}
						data-testid="blocknote-alert-type"
						disabled={!editor.isEditable}
						onClick={() =>
							editor.updateBlock(block, {
								type: "alert",
								props: { type: next.value },
							})
						}
					>
						<Icon size={20} />
					</button>
					<div className="min-w-0 flex-1 text-foreground" ref={contentRef} />
				</div>
			);
		},
		// A note element tagged with the alert type, so HTML import restores it and markdown
		// export degrades to a plain paragraph. Not a <p>: the paragraph block's parse rule
		// would claim it before this block's.
		toExternalHTML: ({ block, contentRef }) => (
			<div role="note" data-alert-type={block.props.type} ref={contentRef} />
		),
		parse: (element) => {
			const type = element.dataset.alertType;
			return type && ALERT_TYPES.some((alert) => alert.value === type)
				? { type: type as AlertType }
				: undefined;
		},
	},
);
