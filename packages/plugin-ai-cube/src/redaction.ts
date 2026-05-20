export interface RedactionResult {
  text: string;
  findings: string[];
}

const secretPatterns: readonly [string, RegExp][] = [
  ["password", /\b(password|passwd|pwd)\s*[:=]\s*\S+/gi],
  ["api_key", /\b(sk-[A-Za-z0-9_-]{12,}|api[_-]?key\s*[:=]\s*\S+)/gi],
  ["token", /\b(token|secret)\s*[:=]\s*\S+/gi],
];

export function redactSecrets(input: string): RedactionResult {
  let text = input;
  const findings = new Set<string>();
  for (const [label, pattern] of secretPatterns) {
    text = text.replace(pattern, () => {
      findings.add(label);
      return `[redacted:${label}]`;
    });
  }
  return { text, findings: [...findings] };
}
