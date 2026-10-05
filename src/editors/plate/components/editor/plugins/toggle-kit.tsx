"use client";

import { TogglePlugin } from "@platejs/toggle/react";

import { IndentKit } from "@/editors/plate/components/editor/plugins/indent-kit";
import { ToggleElement } from "@/editors/plate/ui/toggle-node";

export const ToggleKit = [
	...IndentKit,
	TogglePlugin.withComponent(ToggleElement),
];
