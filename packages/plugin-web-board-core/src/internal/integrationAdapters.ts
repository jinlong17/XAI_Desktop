import type {
  BoardCardAttachmentLink,
  BoardIntegrationProviderId,
} from "../types.js";

export interface BoardIntegrationProvider {
  id: BoardIntegrationProviderId;
  label: string;
  category: "calendar" | "issue" | "file" | "link";
}

export interface BoardIntegrationAttachmentInput {
  id: string;
  providerId: BoardIntegrationProviderId;
  url: string;
  title?: string;
  externalId?: string;
}

export type BoardIntegrationAttachmentResult =
  | {
      status: "valid";
      attachment: BoardCardAttachmentLink;
    }
  | {
      status: "invalid";
      reason: "missing-id" | "unknown-provider" | "invalid-url";
    };

export const BOARD_INTEGRATION_PROVIDER_IDS = [
  "gcal",
  "github",
  "linear",
  "drive",
  "link",
] as const satisfies readonly BoardIntegrationProviderId[];

export const BOARD_INTEGRATION_PROVIDERS = [
  { id: "gcal", label: "Google Calendar", category: "calendar" },
  { id: "github", label: "GitHub", category: "issue" },
  { id: "linear", label: "Linear", category: "issue" },
  { id: "drive", label: "Google Drive", category: "file" },
  { id: "link", label: "Link", category: "link" },
] as const satisfies readonly BoardIntegrationProvider[];

export function isBoardIntegrationProviderId(
  value: unknown,
): value is BoardIntegrationProviderId {
  return (
    typeof value === "string" &&
    (BOARD_INTEGRATION_PROVIDER_IDS as readonly string[]).includes(value)
  );
}

export function getBoardIntegrationProvider(
  providerId: BoardIntegrationProviderId,
): BoardIntegrationProvider {
  return BOARD_INTEGRATION_PROVIDERS.find((provider) => provider.id === providerId)!;
}

function normalizeHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export function createBoardIntegrationAttachment(
  input: BoardIntegrationAttachmentInput,
): BoardIntegrationAttachmentResult {
  const id = input.id.trim();
  if (!id) {
    return { status: "invalid", reason: "missing-id" };
  }
  if (!isBoardIntegrationProviderId(input.providerId)) {
    return { status: "invalid", reason: "unknown-provider" };
  }
  const url = normalizeHttpUrl(input.url);
  if (!url) {
    return { status: "invalid", reason: "invalid-url" };
  }

  const provider = getBoardIntegrationProvider(input.providerId);
  const title = input.title?.trim();
  const externalId = input.externalId?.trim();

  return {
    status: "valid",
    attachment: {
      id,
      url,
      ...(title ? { title } : {}),
      source: {
        kind: "integration",
        providerId: provider.id,
        providerName: provider.label,
        ...(externalId ? { externalId } : {}),
      },
    },
  };
}
