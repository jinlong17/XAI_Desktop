import { describe, expect, it } from "vitest";

import { redactSecrets } from "./redaction";

function expectRedacts(label: string, input: string): ReturnType<typeof redactSecrets> {
  const result = redactSecrets(input);
  expect(result.findings).toContain(label);
  expect(result.text).toContain(`[redacted:${label}]`);
  return result;
}

function expectDoesNotRedact(label: string, input: string): ReturnType<typeof redactSecrets> {
  const result = redactSecrets(input);
  expect(result.findings).not.toContain(label);
  expect(result.text).not.toContain(`[redacted:${label}]`);
  return result;
}

describe("redactSecrets", () => {
  it("redacts bare JWTs", () => {
    expectRedacts("jwt", "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.abcdefghijklmno");
    expectDoesNotRedact("jwt", "eyJ");
  });

  it("redacts GitHub personal access tokens", () => {
    expectRedacts("github_pat", "ghp_1234567890abcdefghij1234567890abcdef");
    expectDoesNotRedact("github_pat", "ghp_short");
  });

  it("redacts AWS access keys", () => {
    expectRedacts("aws_access_key", "AKIAIOSFODNN7EXAMPLE");
    expectDoesNotRedact("aws_access_key", "AKIAabc");
  });

  it("redacts Stripe keys", () => {
    expectRedacts("stripe_secret", "sk_live_1234567890abcdef1234567890");
    expectDoesNotRedact("stripe_secret", "sk_invalid");
  });

  it("redacts OpenAI keys", () => {
    expectRedacts("openai_key", "sk-proj-abcdefghijklmnopqrstuvwxyz01");
    expectDoesNotRedact("openai_key", "sk-short");
  });

  it("redacts bearer tokens before JWTs", () => {
    const result = expectRedacts("bearer", "Bearer eyJhbGciOiJIUzI1NiJ9_abcdefghij");
    expect(result.findings).not.toContain("jwt");
    expectDoesNotRedact("bearer", "Bearer hi");
  });

  it("redacts email addresses", () => {
    expectRedacts("email", "user@example.com");
    expectDoesNotRedact("email", "not-an-email");
  });

  it("redacts SSH private key blocks", () => {
    expectRedacts("ssh_private_key_block", "-----BEGIN OPENSSH PRIVATE KEY-----\nAAAA...\n-----END OPENSSH PRIVATE KEY-----");
    expectDoesNotRedact("ssh_private_key_block", "random text without BEGIN block");
  });

  it("redacts macOS home paths", () => {
    expectRedacts("macos_home_path", "/Users/alice/Documents");
    expectDoesNotRedact("macos_home_path", "/etc/passwd");
  });

  it("redacts credit card numbers only when Luhn passes", () => {
    const result = expectRedacts("credit_card", "buy 4111 1111 1111 1111 today");
    expect(result.text).toContain(" today");
    expectDoesNotRedact("credit_card", "4111 1111 1111 1112");
  });

  it("redacts password assignments", () => {
    expectRedacts("password", "password=correct-horse-battery-staple");
    expectDoesNotRedact("password", "passwordless text");
  });

  it("redacts API key assignments", () => {
    expectRedacts("api_key", "api_key=abc123");
    expectDoesNotRedact("api_key", "api key is not assigned");
  });

  it("redacts token assignments", () => {
    expectRedacts("token", "token=abc123");
    expectDoesNotRedact("token", "tokenize this string");
  });
});
