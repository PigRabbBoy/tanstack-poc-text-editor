export const MAX_IMAGE_BYTES = 1024 * 1024;

export class ImageTooLargeError extends Error {
	constructor(readonly size: number) {
		super(
			`Image is ${(size / 1024 / 1024).toFixed(1)} MB; the limit is 1 MB because documents live in localStorage.`,
		);
	}
}

/** Images are stored inline as data URLs (no upload server in this POC). */
export function fileToDataUrl(file: File): Promise<string> {
	if (file.size > MAX_IMAGE_BYTES)
		return Promise.reject(new ImageTooLargeError(file.size));
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}
