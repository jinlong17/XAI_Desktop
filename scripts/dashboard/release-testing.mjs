export function releaseFailureCount(text) {
  const value = String(text || "").toLowerCase();
  if (!value) return null;

  let total = 0;
  let matched = false;
  const patterns = [
    /\bfailure_count\s*[:=]\s*(\d+)\b/g,
    /\b(\d+)\s+(?:http\s+)?(?:failures?|errors?|console\s+errors?)\b/g,
    /\b(?:http\s+)?(?:failures?|errors?|console\s+errors?)\s*[:=]\s*(\d+)\b/g,
    /(?:失败|错误)\s*[:=：]\s*(\d+)/g,
    /(\d+)\s*(?:个|项)?\s*(?:失败|错误)/g
  ];

  for (const pattern of patterns) {
    for (const match of value.matchAll(pattern)) {
      matched = true;
      total += Number(match[1]) || 0;
    }
  }

  if (matched) return total;
  if (/\b(?:zero|no)[-\s]+(?:http\s+)?(?:failures?|errors?|console\s+errors?)\b|(?:无|没有)(?:失败|错误)/.test(value)) {
    return 0;
  }
  return null;
}

export function releaseTestVerdict(text) {
  const value = String(text || "").toLowerCase();
  if (!value) return "unknown";

  const failureCount = releaseFailureCount(value);
  if (failureCount !== null && failureCount > 0) return "fail";
  if (/failed|failure|fail\b|失败|阻断|\bred\b/.test(value) && failureCount !== 0) return "fail";
  if (/未跑|not run|skipped|deferred|partial|blocked|阻塞|跳过|待补|仍被|仍需/.test(value)) return "partial";
  if (failureCount === 0) return "pass";
  if (/passed|pass\b|green|exit 0|confirmed|成功|通过/.test(value)) return "pass";
  return "unknown";
}

export function releaseTestCategories(text) {
  const value = String(text || "").toLowerCase();
  const categories = [];
  const add = key => { if (!categories.includes(key)) categories.push(key); };
  if (/self[- ]?test|自测|manual smoke|browser smoke|smoke/.test(value)) add("self_test");
  if (/unit|vitest|cargo test|test\)/.test(value)) add("unit");
  if (/e2e|playwright|browser smoke|chrome|safari|firefox|端到端/.test(value)) add("e2e");
  if (/backend|api|cargo|rust|tauri|sqlite|supabase|rls|后端/.test(value)) add("backend");
  if (/frontend|page|browser|chrome|390px|responsive|页面/.test(value)) add("frontend_page");
  if (/build|typecheck|check-types|lint|eslint|node --check|构建/.test(value)) add("build");
  if (/deploy|pre.?deploy|csp|cloudflare|上线|部署/.test(value)) add("pre_deploy");
  if (/regression|回归/.test(value)) add("regression");
  return categories.length ? categories : ["self_test"];
}
