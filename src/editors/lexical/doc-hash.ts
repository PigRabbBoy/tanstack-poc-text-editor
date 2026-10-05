import type { SerializedDocument } from "@lexical/file";

/**
 * gzip + base64url of a @lexical/file SerializedDocument in the URL hash, the
 * way the Lexical playground's Share button works (no server involved).
 */
const PREFIX = "#doc=";

async function streamToBytes(stream: ReadableStream<Uint8Array>) {
	return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function docToHash(doc: SerializedDocument): Promise<string> {
	const input = new Blob([JSON.stringify(doc)]).stream();
	const bytes = await streamToBytes(
		input.pipeThrough(new CompressionStream("gzip")),
	);
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return `${PREFIX}${btoa(binary).replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "")}`;
}

export async function docFromHash(
	hash: string,
): Promise<SerializedDocument | null> {
	if (!hash.startsWith(PREFIX)) return null;
	try {
		const binary = atob(
			hash.slice(PREFIX.length).replace(/_/g, "/").replace(/-/g, "+"),
		);
		const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
		const text = await new Response(
			new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip")),
		).text();
		return JSON.parse(text) as SerializedDocument;
	} catch {
		return null;
	}
}
