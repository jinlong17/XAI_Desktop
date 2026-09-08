import type { AiModelId } from "../types.js";

export type AiProviderId =
  | "anthropic"
  | "openai-compatible"
  | "gemini"
  | "deepseek";

export type AiProviderTransport = "anthropic" | "openai-compatible";

export interface AiModelOption {
  readonly id: AiModelId;
  readonly label: string;
  readonly descEn: string;
  readonly descZh: string;
}

export interface AiProviderPreset {
  readonly id: AiProviderId;
  readonly label: string;
  readonly labelZh: string;
  readonly transport: AiProviderTransport;
  readonly baseUrl: string;
  readonly defaultModel: AiModelId;
  readonly models: readonly AiModelOption[];
  readonly managedBaseUrl: boolean;
}

const ANTHROPIC_MODELS: readonly AiModelOption[] = [
  { id: "haiku", label: "Haiku", descEn: "Fast", descZh: "快速" },
  { id: "sonnet", label: "Sonnet", descEn: "Balanced", descZh: "均衡" },
  { id: "opus", label: "Opus", descEn: "Advanced", descZh: "高级" },
];

const GEMINI_MODELS: readonly AiModelOption[] = [
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    descEn: "Stable frontier Flash",
    descZh: "稳定前沿 Flash",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash Lite",
    descEn: "Google OpenAI-compatible",
    descZh: "Google OpenAI 兼容",
  },
];

const DEEPSEEK_MODELS: readonly AiModelOption[] = [
  {
    id: "deepseek-v4-flash",
    label: "DeepSeek V4 Flash",
    descEn: "Fast",
    descZh: "快速",
  },
  {
    id: "deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    descEn: "Advanced",
    descZh: "高级",
  },
];

export const AI_PROVIDER_PRESETS: readonly AiProviderPreset[] = Object.freeze([
  {
    id: "anthropic",
    label: "Anthropic",
    labelZh: "Anthropic",
    transport: "anthropic",
    baseUrl: "",
    defaultModel: "haiku",
    models: ANTHROPIC_MODELS,
    managedBaseUrl: true,
  },
  {
    id: "gemini",
    label: "Google Gemini",
    labelZh: "Google Gemini",
    transport: "openai-compatible",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    defaultModel: "gemini-3.1-flash-lite",
    models: GEMINI_MODELS,
    managedBaseUrl: true,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    labelZh: "DeepSeek",
    transport: "openai-compatible",
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-v4-flash",
    models: DEEPSEEK_MODELS,
    managedBaseUrl: true,
  },
  {
    id: "openai-compatible",
    label: "Custom OpenAI-compatible",
    labelZh: "自定义 OpenAI 兼容",
    transport: "openai-compatible",
    baseUrl: "",
    defaultModel: "haiku",
    models: ANTHROPIC_MODELS,
    managedBaseUrl: false,
  },
]);

export function normalizeAiProviderId(input: unknown): AiProviderId {
  return AI_PROVIDER_PRESETS.some((preset) => preset.id === input)
    ? (input as AiProviderId)
    : "anthropic";
}

export function getAiProviderPreset(input: unknown): AiProviderPreset {
  const id = normalizeAiProviderId(input);
  return AI_PROVIDER_PRESETS.find((preset) => preset.id === id) ?? AI_PROVIDER_PRESETS[0]!;
}

export function isAiModelId(input: string): input is AiModelId {
  return AI_PROVIDER_PRESETS.some((preset) =>
    preset.models.some((model) => model.id === input),
  );
}
