import { useEffect, useMemo, useRef } from "react";

export function useDebouncedCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delay: number,
) {
	const latest = useRef(callback);
	latest.current = callback;
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	return useMemo(
		() =>
			(...args: Args) => {
				clearTimeout(timer.current);
				timer.current = setTimeout(() => latest.current(...args), delay);
			},
		[delay],
	);
}
