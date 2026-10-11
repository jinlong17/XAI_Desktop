import { accountScope, generationMarkerKey } from "@repo/plugin-web-storage";
/** Explicit account initialization after clearing a fixture origin. */
export function resetAccountFixture() {
  localStorage.clear();
  const transition = accountScope.lock("ai-test-account");
  localStorage.setItem(
    generationMarkerKey("ai-test-account"),
    JSON.stringify({ generation: "test", migrationId: "test", previous: null }),
  );
  accountScope.activate(transition, "test");
}
