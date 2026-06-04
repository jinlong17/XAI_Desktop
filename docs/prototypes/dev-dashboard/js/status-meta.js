// Shared status vocabulary (single source of truth).
// No-bundler app: this file is loaded as a plain <script> AFTER state.js and
// BEFORE any consumer (overview.js, product-flow.js, …). It exposes script-scope
// globals — do NOT add import/export. See BOUNDARIES.md §1.2 / §6 rule 5.
//
// Feature 生命周期 vocabulary maps each status to its display label + shared
// badge color class (the b-* classes are the cross-page status palette in
// styles.css :root). Previously this object was forked in product-flow.js and
// re-implemented inline in overview.js; both now reference these globals.
const FEATURE_STATUS = {
  shipped: { label: "已交付", cls: "b-green" },
  "in-dev": { label: "开发中", cls: "b-cyan" },
  planned: { label: "规划", cls: "b-blue" },
  proposed: { label: "提案", cls: "b-gray" },
  paused: { label: "暂停", cls: "b-yellow" },
  contested: { label: "方向待定", cls: "b-red" }
};

// Canonical render/count order for the 6 feature lifecycle states.
const FEATURE_STATUS_ORDER = ["shipped", "in-dev", "planned", "proposed", "paused", "contested"];

// "shipped" / "in-dev" are the two surfaced-individually buckets; everything
// else (planned/proposed/paused/contested) collapses into a "规划 / 待定" group
// in the Overview mirrors. Single source so the grouping never drifts.
const FEATURE_STATUS_PLANNING = ["planned", "proposed", "paused", "contested"];

function featureMeta(status){
  return FEATURE_STATUS[status] || { label: status, cls: "b-blue" };
}

const DEPLOYMENT_STATUS_META = {
  not_deployed: {label:"未部署", badge:"b-gray", tone:"gray"},
  ready: {label:"准备部署", badge:"b-blue", tone:"blue"},
  deploying: {label:"部署中", badge:"b-cyan", tone:"cyan"},
  deployed: {label:"已部署", badge:"b-green", tone:"green"},
  failed: {label:"部署失败", badge:"b-red", tone:"red"},
  rollback: {label:"需要回滚", badge:"b-purple", tone:"purple"},
  success: {label:"成功", badge:"b-green", tone:"green"},
  pending: {label:"待处理", badge:"b-yellow", tone:"yellow"}
};

function deploymentStatusMeta(status){
  return DEPLOYMENT_STATUS_META[status] || DEPLOYMENT_STATUS_META.pending;
}

const TEST_STATUS_META = {
  pass: { label:"通过", badge:"b-green", tone:"green" },
  fail: { label:"失败", badge:"b-red", tone:"red" },
  partial: { label:"部分通过", badge:"b-yellow", tone:"yellow" },
  stale: { label:"过期", badge:"b-purple", tone:"purple" },
  unknown: { label:"未登记", badge:"b-gray", tone:"gray" },
  "not_run": { label:"未运行", badge:"b-gray", tone:"gray" }
};

function testStatusMeta(status){
  return TEST_STATUS_META[status] || TEST_STATUS_META.unknown;
}
