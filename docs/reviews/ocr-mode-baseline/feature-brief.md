# G4-S10 OCR Mode Baseline Feature Brief

## Goal

Define the OCR preview UI and data contract for image clipboard entries without implementing a real OCR engine.

## Scope

- `OcrPreview` component.
- `OcrResult` and block-level text result shape.
- Mock OCR output for image clipboard entries.

## Out of Scope

- macOS Vision integration.
- AI OCR integration.
- Image preprocessing.

## Validation

- `pnpm --filter @repo/plugin-clipboard check-types`
