import { FEATURES, type FeatureId } from "@/data/features";
import type { FeatureSupport } from "@/editors/types";

/** Placeholder until an editor's meta is filled in from the POC. */
export function pendingFeatures(): Record<FeatureId, FeatureSupport> {
	return Object.fromEntries(
		FEATURES.map((feature) => [
			feature.id,
			{ status: "unsupported", note: "Not evaluated yet" },
		]),
	) as Record<FeatureId, FeatureSupport>;
}
