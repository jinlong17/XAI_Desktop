/**
 * XSS payload fixtures for security testing.
 *
 * These strings represent known XSS attack vectors that must be
 * safely escaped before rendering in the palette result list.
 *
 * All payloads are expected to be rendered as text, NOT executed.
 * Test assertion: container.querySelector("script") === null
 * AND label innerHTML does NOT contain unescaped `<` or `>`.
 *
 * xai-web-cmdk HC7, test.md §2.7 EH1..EH12, PR3, PR4
 */

/** Basic XSS via script injection */
export const SCRIPT_TAG = '<script>alert("xss")</script>';

/** Attribute injection */
export const IMG_ONERROR = '<img src=x onerror=alert(1)>';

/** Event handler injection via anchor */
export const ANCHOR_HREF = '<a href="javascript:alert(1)">click me</a>';

/** SVG-based XSS */
export const SVG_ONLOAD = '<svg onload=alert(1)>';

/** HTML entities that could be double-decoded */
export const HTML_ENTITY_DOUBLE = '&lt;script&gt;alert(1)&lt;/script&gt;';

/** Unicode homoglyph attack */
export const UNICODE_HOMOGLYPH = '<script>alert(1)</script>';

/** CSS expression injection (IE legacy) */
export const CSS_EXPRESSION = '<style>body{color:expression(alert(1))}</style>';

/** Null byte injection */
export const NULL_BYTE = 'foo\x00<script>alert(1)</script>';

/** HTML comment injection */
export const HTML_COMMENT = '<!--<script>alert(1)</script>-->';

/** Backtick injection (template literal attack) */
export const BACKTICK_INJECTION = '`${alert(1)}`';

/** Right-to-left override character */
export const RTL_OVERRIDE = '‮<script>alert(1)</script>';

/**
 * All XSS payloads as a flat array for table-driven tests.
 * Each payload:
 * - Should NOT produce a <script> element in DOM
 * - Should NOT produce unescaped HTML tags in innerHTML
 * - SHOULD appear as visible text (escaped form) in the label element
 */
export const ALL_XSS_PAYLOADS = [
  SCRIPT_TAG,
  IMG_ONERROR,
  ANCHOR_HREF,
  SVG_ONLOAD,
  HTML_ENTITY_DOUBLE,
  UNICODE_HOMOGLYPH,
  CSS_EXPRESSION,
  NULL_BYTE,
  HTML_COMMENT,
  BACKTICK_INJECTION,
  RTL_OVERRIDE,
] as const;
