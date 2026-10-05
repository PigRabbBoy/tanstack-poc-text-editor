"use client";

import { ExcalidrawPlugin } from "@platejs/excalidraw/react";

import { ExcalidrawElement } from "@/editors/plate/ui/excalidraw-node";

export const ExcalidrawKit = [
	ExcalidrawPlugin.withComponent(ExcalidrawElement),
];
