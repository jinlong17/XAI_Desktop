# Proposed Contract Changes: OCR Mode Baseline

## Need

Real OCR requires a desktop or AI service adapter and should not be hard-coded inside the clipboard UI.

## Proposed Tauri Command

- `ocr_recognize_clipboard_image(payload: { entryId: string; imageRef: string; engine?: "macos-vision" | "ai" }): OcrResult`

## Proposed Events

- `clipboard:ocr-requested`
- `clipboard:ocr-completed`
- `clipboard:ocr-failed`

## Notes

The current `OcrPreview` uses `engine: "mock"` and local result generation.
