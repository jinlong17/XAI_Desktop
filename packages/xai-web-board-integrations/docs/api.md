# API Contract - xai-web-board-integrations

## Board-Core Types

```ts
type BoardIntegrationProviderId =
  | "gcal"
  | "github"
  | "linear"
  | "drive"
  | "link";

interface BoardAttachmentIntegrationSource {
  kind: "integration";
  providerId: BoardIntegrationProviderId;
  providerName: string;
  externalId?: string;
}

interface BoardCardAttachmentLink {
  id: string;
  url: string;
  title?: string;
  source?: BoardAttachmentIntegrationSource;
}
```

## Board-Core Helper

```ts
function createBoardIntegrationAttachment(
  input: {
    id: string;
    providerId: BoardIntegrationProviderId;
    url: string;
    title?: string;
    externalId?: string;
  },
): BoardIntegrationAttachmentResult;
```

Rules:

- Only `http:` and `https:` URLs are accepted.
- Unknown provider ids are rejected.
- Empty ids are rejected.
- `providerName` is derived from the board-core provider catalog.
- The helper is pure and never touches storage, Settings prefs, OAuth state, or
  the network.

## Settings Relationship

Settings currently owns stub connection prefs for Notion, GCal, and Linear.
This row does not read those prefs directly. Board's adapter metadata is
compatible with those settings but does not interpret a stub pref as a real
connected account.

## Non-Contracts

- No token contract.
- No remote provider API.
- No sync conflict format.
- No webhook/event subscription.
