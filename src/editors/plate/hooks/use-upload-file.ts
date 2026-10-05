import * as React from "react";
import { toast } from "sonner";
import { fileToDataUrl } from "@/lib/image";

/**
 * POC replacement for the Plate registry's uploadthing hook: files are never
 * uploaded, they are inlined as base64 data URLs (≤1 MB, see `@/lib/image`).
 */
export type UploadedFile = {
	key: string;
	name: string;
	size: number;
	type: string;
	url: string;
};

interface UseUploadFileProps {
	onUploadComplete?: (file: UploadedFile) => void;
	onUploadError?: (error: unknown) => void;
}

export function useUploadFile({
	onUploadComplete,
	onUploadError,
}: UseUploadFileProps = {}) {
	const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
	const [uploadingFile, setUploadingFile] = React.useState<File>();
	const [progress, setProgress] = React.useState<number>(0);
	const [isUploading, setIsUploading] = React.useState(false);
	const [error, setError] = React.useState<unknown>();

	async function uploadFile(file: File) {
		setIsUploading(true);
		setUploadingFile(file);
		setProgress(10);

		try {
			const url = await fileToDataUrl(file);
			const result: UploadedFile = {
				key: `${Date.now()}-${file.name}`,
				name: file.name,
				size: file.size,
				type: file.type,
				url,
			};
			setProgress(100);
			setUploadedFile(result);
			onUploadComplete?.(result);
			return result;
		} catch (err) {
			showErrorToast(err);
			setError(err);
			onUploadError?.(err);
			return undefined;
		} finally {
			setProgress(0);
			setIsUploading(false);
			setUploadingFile(undefined);
		}
	}

	return {
		error,
		isUploading,
		progress,
		uploadedFile,
		uploadFile,
		uploadingFile,
	};
}

export function getErrorMessage(err: unknown) {
	if (err instanceof Error) return err.message;
	return "Something went wrong, please try again later.";
}

export function showErrorToast(err: unknown) {
	return toast.error(getErrorMessage(err));
}
