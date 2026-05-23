/**
 * Type aliases over the global EventMap from @repo/core.
 *
 * WebEventKey — the subset of EventMap keys that begin with "web:".
 * WebEventMap — the projected sub-map of those keys.
 *
 * These types are the compile-time surface of the bus. The runtime
 * transport (EventTarget) lives in emitter.ts.
 *
 * ADR anchor: ADR-0007 §S7 — EventMap source-of-truth stays in @repo/core;
 * this file only re-exports a filtered projection for ergonomic downstream use.
 */
import type { EventMap } from '@repo/core/types';

/** All EventMap keys that begin with the "web:" prefix. */
export type WebEventKey = Extract<keyof EventMap, `web:${string}`>;

/** Projected sub-map: only the web:* channels. */
export type WebEventMap = { [K in WebEventKey]: EventMap[K] };
