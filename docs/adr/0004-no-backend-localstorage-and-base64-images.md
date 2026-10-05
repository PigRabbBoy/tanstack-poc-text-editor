# No backend: documents in localStorage, images as base64 (≤1 MB)

Each editor's JSON is saved under its own localStorage key, and uploaded images are inlined as data URLs capped at 1 MB. The POC compares editors, not storage, so we avoid provisioning D1/R2. Large images and multi-device sync are out of scope until a persistence follow-up.
