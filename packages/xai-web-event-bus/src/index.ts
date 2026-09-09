/**
 * @repo/xai-web-event-bus — Browser-only typed event bus for the XAI Web SPA.
 *
 * Public surface (index.ts is the ONLY allowed entry point):
 *   emitWebEvent      — type-safe synchronous emitter
 *   onWebEvent        — imperative subscription (returns unsubscribe fn)
 *   useWebEventListener — React hook (auto-cleanup on unmount)
 *   WebEventMap       — type alias: projected web:* sub-map of EventMap
 *   WebEventKey       — type alias: union of all web:* channel names
 *
 * Deep imports from src/internal/ are forbidden per CLAUDE.md §"Code Boundaries".
 *
 * ADR anchor: ADR-0007 §S7.
 */
export { emitWebEvent, onWebEvent } from './emitter';
export { useWebEventListener } from './listener';
export type { WebEventMap, WebEventKey } from './events';
export { executeToolWrite } from './toolWriteReceipt';
export type { DurableToolWriteResult, ToolWriteChannel, ToolWriteResult } from './toolWriteReceipt';
