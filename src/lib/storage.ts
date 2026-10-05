import { useCallback, useEffect, useState } from "react";

const PREFIX = "tanstack-poc-text-editor:";

function read<T>(key: string): T | null {
	try {
		const raw = window.localStorage.getItem(PREFIX + key);
		return raw === null ? null : (JSON.parse(raw) as T);
	} catch {
		return null;
	}
}

/**
 * localStorage-backed value that is `null` during SSR and before hydration,
 * so server HTML never depends on browser state.
 */
export function useStoredValue<T>(key: string) {
	const [value, setValue] = useState<T | null>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setValue(read<T>(key));
		setLoaded(true);
	}, [key]);

	const save = useCallback(
		(next: T) => {
			try {
				window.localStorage.setItem(PREFIX + key, JSON.stringify(next));
			} catch (error) {
				console.warn(`Could not persist ${key}`, error);
			}
		},
		[key],
	);

	const clear = useCallback(() => {
		window.localStorage.removeItem(PREFIX + key);
		setValue(null);
	}, [key]);

	return { value, loaded, save, clear };
}
