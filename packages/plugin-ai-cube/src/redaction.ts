export interface RedactionResult {
  text: string;
  findings: string[];
}

const secretPatterns: readonly [string, RegExp][] = [
  ["jwt", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ["github_pat", /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g],
  ["aws_access_key", /\bAKIA[0-9A-Z]{16}\b/g],
  ["stripe_secret", /\b(sk|pk)_(live|test)_[A-Za-z0-9]{16,}\b/g],
  ["slack_token", /\bxox[bpars]-[A-Za-z0-9-]{10,}\b/g],
  ["openai_key", /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ["ssh_private_key_block", /-----BEGIN (?:RSA |OPENSSH |EC |DSA |PGP )?PRIVATE KEY-----[\s\S]+?-----END [^-]*PRIVATE KEY-----/g],
  ["bearer", /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/g],
  ["email", /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g],
  ["macos_home_path", /\/Users\/[^/\s]+(?=\/|\s|$)/g],
  // Credit card handled separately with Luhn check below.
  ["password", /\b(?:password|passwd|pwd)\s*[:=]\s*\S+/gi],
  ["api_key", /\b(?:api[_-]?key)\s*[:=]\s*\S+/gi],
  ["token", /\b(?:token|secret)\s*[:=]\s*\S+/gi],
];

const ccCandidate = /\b(?:\d[ -]?){13,19}\b/g;

function luhn(raw: string): boolean {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function redactSecrets(input: string): RedactionResult {
  let text = input;
  const findings = new Set<string>();
  for (const [label, pattern] of secretPatterns) {
    text = text.replace(pattern, () => {
      findings.add(label);
      return `[redacted:${label}]`;
    });
  }
  text = text.replace(ccCandidate, (match) => {
    if (!luhn(match)) {
      return match;
    }
    findings.add("credit_card");
    return "[redacted:credit_card]";
  });
  return { text, findings: [...findings] };
}
