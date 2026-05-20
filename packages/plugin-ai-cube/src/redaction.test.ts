// TODO: enable when vitest is wired for this workspace package.

import { redactSecrets } from "./redaction";

function assertRedacts(label: string, input: string): void {
  const result = redactSecrets(input);
  if (!result.findings.includes(label)) {
    throw new Error(`Expected ${label} finding for ${input}`);
  }
  if (!result.text.includes(`[redacted:${label}]`)) {
    throw new Error(`Expected ${label} redaction for ${input}`);
  }
}

function assertDoesNotRedact(label: string, input: string): void {
  const result = redactSecrets(input);
  if (result.findings.includes(label)) {
    throw new Error(`Unexpected ${label} finding for ${input}`);
  }
  if (result.text.includes(`[redacted:${label}]`)) {
    throw new Error(`Unexpected ${label} redaction for ${input}`);
  }
}

if (false) {
  assertRedacts("jwt", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.abcdefghijklmno");
  assertDoesNotRedact("jwt", "eyJ");

  assertRedacts("github_pat", "ghp_1234567890abcdefghij1234567890abcdef");
  assertDoesNotRedact("github_pat", "ghp_short");

  assertRedacts("aws_access_key", "AKIAIOSFODNN7EXAMPLE");
  assertDoesNotRedact("aws_access_key", "AKIAabc");

  assertRedacts("stripe_secret", "sk_live_1234567890abcdef1234567890");
  assertDoesNotRedact("stripe_secret", "sk_invalid");

  assertRedacts("openai_key", "sk-proj-abcdefghijklmnopqrstuvwxyz01");
  assertDoesNotRedact("openai_key", "sk-short");

  assertRedacts("bearer", "Bearer eyJhbGciOiJIUzI1NiJ9_abcdefghij");
  assertDoesNotRedact("bearer", "Bearer hi");

  assertRedacts("email", "user@example.com");
  assertDoesNotRedact("email", "not-an-email");

  assertRedacts("ssh_private_key_block", "-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA...\n-----END OPENSSH PRIVATE KEY-----");
  assertDoesNotRedact("ssh_private_key_block", "random text without BEGIN block");

  assertRedacts("macos_home_path", "/Users/alice/Documents");
  assertDoesNotRedact("macos_home_path", "/etc/passwd");

  assertRedacts("credit_card", "4111 1111 1111 1111");
  assertDoesNotRedact("credit_card", "4111 1111 1111 1112");

  assertRedacts("password", "password=correct-horse-battery-staple");
  assertDoesNotRedact("password", "passwordless text");

  assertRedacts("api_key", "api_key=abc123");
  assertDoesNotRedact("api_key", "api key is not assigned");

  assertRedacts("token", "token=abc123");
  assertDoesNotRedact("token", "tokenize this string");
}
