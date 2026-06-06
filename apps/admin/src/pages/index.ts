/**
 * apps/admin/src/pages/index.ts — page registry (Phase 4).
 *
 * Maps each prototype view key to its ported page component + nav metadata.
 * The 10 keys mirror the prototype's `data-view` set (dashboard, users, boards,
 * features, ai, providers, roles, billing, audit, settings). The Tweaks panel is
 * intentionally EXCLUDED (design-review-only per INTEGRATION_PLAN §1).
 */
import type { ComponentType } from "react";
import { DashboardPage } from "./DashboardPage";
import { UsersPage } from "./UsersPage";
import { OrgsPage } from "./OrgsPage";
import { FeaturesPage } from "./FeaturesPage";
import { AiUsagePage } from "./AiUsagePage";
import { ProvidersPage } from "./ProvidersPage";
import { RolesPage } from "./RolesPage";
import { BillingPage } from "./BillingPage";
import { AuditPage } from "./AuditPage";
import { SettingsPage } from "./SettingsPage";

export interface AdminPage {
  key: string;
  title: string;
  icon: string;
  Component: ComponentType;
}

export const ADMIN_PAGES: AdminPage[] = [
  { key: "dashboard", title: "总览看板", icon: "📊", Component: DashboardPage },
  { key: "users", title: "用户管理", icon: "👥", Component: UsersPage },
  { key: "boards", title: "组织 / 空间", icon: "🏢", Component: OrgsPage },
  { key: "features", title: "功能管理", icon: "🧩", Component: FeaturesPage },
  { key: "ai", title: "AI 用量 & 配额", icon: "🤖", Component: AiUsagePage },
  { key: "providers", title: "Provider 配置", icon: "🔌", Component: ProvidersPage },
  { key: "roles", title: "角色与权限", icon: "🛡️", Component: RolesPage },
  { key: "billing", title: "订阅 / 计费", icon: "💳", Component: BillingPage },
  { key: "audit", title: "审计日志", icon: "📜", Component: AuditPage },
  { key: "settings", title: "系统设置", icon: "⚙️", Component: SettingsPage },
];
