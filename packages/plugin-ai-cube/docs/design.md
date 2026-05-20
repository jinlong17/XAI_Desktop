# plugin-ai-cube Design

AI Cube never calls a real API in this scaffold. `useAiConversation` gates every send with `PrivacyGateDialog`, redacts mock secret patterns, and returns deterministic mock responses.

Cost and latency guards are local controls. Offline mode uses cached fallback text.
