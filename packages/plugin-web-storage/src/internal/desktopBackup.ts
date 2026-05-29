import {
  applyDesktopBackupBundle,
  countUnresolvedOutboxRows,
  createDesktopBackupBundle,
  createTauriRepo,
  verifyDesktopBackupApply,
  verifyDesktopBackupBundleJson,
  type DesktopBackupRestoreStatus,
  type DesktopBackupVerifyStatus,
  type Repo,
  type RepoRecord,
} from "@repo/core-data";

import {
  DESKTOP_REPO_NAMESPACE,
  readDesktopRepoBridgeRepo,
} from "./desktopRepoBridge.js";

const BACKUP_VERIFY_STATUSES: readonly DesktopBackupVerifyStatus[] = [
  "verified_full",
  "verified_partial",
  "corrupt",
  "incompatible",
  "failed",
];

type BackupInvoke = <T>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>;

type BackupWriteOutput = {
  path: string;
  bytes: number;
  managedPath: boolean;
};

type BackupReadOutput = {
  path: string;
  bytes: number;
  json: string;
};

type BackupVerifyOutput = {
  path: string;
  bytes: number;
  validJson: boolean;
  managedPath: boolean;
};

export interface DesktopBackupReport {
  status: DesktopBackupVerifyStatus | DesktopBackupRestoreStatus;
  path: string | null;
  managedPath: boolean;
  applyRequested: boolean;
  warnings: string[];
  restorableRecordCount: number;
  excludedRecordCount: number;
  unresolvedSourceOutboxCount: number;
  unresolvedTargetOutboxCount: number;
  restorableFingerprint: string;
  byteSize: number;
  error?: {
    code: string;
    message: string;
  };
}

let desktopBackupRuntimeEnabled = false;
let desktopBackupOperationActive = false;
let lastDesktopBackupReport: DesktopBackupReport | null = null;

export function setDesktopBackupRuntimeEnabled(enabled: boolean): void {
  desktopBackupRuntimeEnabled = enabled;
  if (!enabled) {
    desktopBackupOperationActive = false;
    lastDesktopBackupReport = null;
  }
}

export function getLastDesktopBackupReport(): DesktopBackupReport | null {
  return lastDesktopBackupReport;
}

export async function createDesktopBackupArtifact(input?: {
  destinationPath?: string;
}): Promise<DesktopBackupReport> {
  return withRuntimeLock(async () => {
    const dependencies = await resolveDependencies();
    if (dependencies.error) {
      return dependencies.error;
    }

    const records = await dependencies.repo.list();
    const bundle = createDesktopBackupBundle({ records });
    const verify = verifyDesktopBackupBundleJson(JSON.stringify(bundle));
    if (!verify.bundle || !BACKUP_VERIFY_STATUSES.includes(verify.status)) {
      return failReport({
        message: verify.reason ?? "bundle verification failed",
      });
    }

    try {
      const write = await dependencies.invoke<BackupWriteOutput>(
        "db_backup_write_bundle",
        {
          input: {
            destinationPath: input?.destinationPath,
            json: JSON.stringify(bundle),
          },
        },
      );

      const report = {
        status: verify.status,
        path: write.path,
        managedPath: write.managedPath,
        applyRequested: false,
        warnings: verify.warnings,
        restorableRecordCount: verify.restorableRecordCount,
        excludedRecordCount: verify.excludedRecordCount,
        unresolvedSourceOutboxCount: verify.unresolvedOutboxCount,
        unresolvedTargetOutboxCount: 0,
        restorableFingerprint: verify.restorableFingerprint,
        byteSize: write.bytes,
      } satisfies DesktopBackupReport;
      lastDesktopBackupReport = report;
      return report;
    } catch (error) {
      const report = failReport({
        message: asErrorMessage(error, "failed to write backup artifact"),
        code: "write_failed",
      });
      lastDesktopBackupReport = report;
      return report;
    }
  });
}

export async function verifyDesktopBackupArtifact(input: {
  path: string;
}): Promise<DesktopBackupReport> {
  return withRuntimeLock(async () => {
    const dependencies = await resolveDependencies();
    if (dependencies.error) {
      return dependencies.error;
    }

    const verified = await verifyBundleFromPath({
      invoke: dependencies.invoke,
      path: input.path,
    });
    const report = toReportFromVerified({
      verified,
      applyRequested: false,
      unresolvedTargetOutboxCount: 0,
    });
    lastDesktopBackupReport = report;
    return report;
  });
}

export async function importDesktopBackupArtifact(input: {
  path: string;
  apply?: boolean;
}): Promise<DesktopBackupReport> {
  return withRuntimeLock(async () => {
    const dependencies = await resolveDependencies();
    if (dependencies.error) {
      return dependencies.error;
    }

    const verified = await verifyBundleFromPath({
      invoke: dependencies.invoke,
      path: input.path,
    });

    if (!input.apply) {
      const report = toReportFromVerified({
        verified,
        applyRequested: false,
        unresolvedTargetOutboxCount: 0,
      });
      lastDesktopBackupReport = report;
      return report;
    }

    if (!verified.result.bundle) {
      const report = toReportFromVerified({
        verified,
        applyRequested: true,
        unresolvedTargetOutboxCount: 0,
      });
      lastDesktopBackupReport = report;
      return report;
    }

    const unresolvedTargetOutboxCount = await countUnresolvedOutboxRows(
      dependencies.repo,
    );
    if (unresolvedTargetOutboxCount > 0) {
      const report = failReport({
        message:
          `target repo has ${unresolvedTargetOutboxCount} unresolved sync.outbox rows`,
        code: "target_outbox_not_empty",
        path: verified.path,
        managedPath: verified.managedPath,
        applyRequested: true,
        restorableRecordCount: verified.result.restorableRecordCount,
        excludedRecordCount: verified.result.excludedRecordCount,
        unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
        unresolvedTargetOutboxCount,
        restorableFingerprint: verified.result.restorableFingerprint,
        byteSize: verified.byteSize,
      });
      lastDesktopBackupReport = report;
      return report;
    }

    let applyResult;
    try {
      applyResult = await applyDesktopBackupBundle({
        repo: dependencies.repo,
        bundle: verified.result.bundle,
      });
    } catch (error) {
      const report = failReport({
        message: asErrorMessage(error, "backup apply failed"),
        code: "apply_failed",
        path: verified.path,
        managedPath: verified.managedPath,
        applyRequested: true,
        restorableRecordCount: verified.result.restorableRecordCount,
        excludedRecordCount: verified.result.excludedRecordCount,
        unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
        unresolvedTargetOutboxCount: 0,
        restorableFingerprint: verified.result.restorableFingerprint,
        byteSize: verified.byteSize,
      });
      lastDesktopBackupReport = report;
      return report;
    }

    if (applyResult.status === "failed") {
      const report = failReport({
        message:
          applyResult.warnings[0] ??
          "backup apply failed because target repo is not restorable",
        code: "apply_failed",
        path: verified.path,
        managedPath: verified.managedPath,
        applyRequested: true,
        warnings: applyResult.warnings,
        restorableRecordCount: verified.result.restorableRecordCount,
        excludedRecordCount: verified.result.excludedRecordCount,
        unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
        unresolvedTargetOutboxCount: applyResult.unresolvedTargetOutboxCount,
        restorableFingerprint: verified.result.restorableFingerprint,
        byteSize: verified.byteSize,
      });
      lastDesktopBackupReport = report;
      return report;
    }

    const postVerify = await verifyDesktopBackupApply({
      repo: dependencies.repo,
      bundle: verified.result.bundle,
    });

    if (!postVerify.match) {
      const report = failReport({
        message:
          "post-restore verification mismatch between bundle and live repo",
        code: "post_verify_failed",
        path: verified.path,
        managedPath: verified.managedPath,
        applyRequested: true,
        warnings: applyResult.warnings,
        restorableRecordCount: verified.result.restorableRecordCount,
        excludedRecordCount: verified.result.excludedRecordCount,
        unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
        unresolvedTargetOutboxCount: 0,
        restorableFingerprint: verified.result.restorableFingerprint,
        byteSize: verified.byteSize,
      });
      lastDesktopBackupReport = report;
      return report;
    }

    const report = {
      status: applyResult.status,
      path: verified.path,
      managedPath: verified.managedPath,
      applyRequested: true,
      warnings: applyResult.warnings,
      restorableRecordCount: verified.result.restorableRecordCount,
      excludedRecordCount: verified.result.excludedRecordCount,
      unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
      unresolvedTargetOutboxCount: 0,
      restorableFingerprint: verified.result.restorableFingerprint,
      byteSize: verified.byteSize,
    } satisfies DesktopBackupReport;

    lastDesktopBackupReport = report;
    return report;
  });
}

export function __resetDesktopBackupStateForTests(): void {
  desktopBackupRuntimeEnabled = false;
  desktopBackupOperationActive = false;
  lastDesktopBackupReport = null;
}

async function verifyBundleFromPath(input: {
  invoke: BackupInvoke;
  path: string;
}): Promise<{
  result: ReturnType<typeof verifyDesktopBackupBundleJson>;
  path: string;
  managedPath: boolean;
  byteSize: number;
}> {
  const verifyOutput = await input.invoke<BackupVerifyOutput>(
    "db_backup_verify_bundle",
    {
      input: {
        path: input.path,
      },
    },
  );

  const readOutput = await input.invoke<BackupReadOutput>("db_backup_read_bundle", {
    input: {
      path: input.path,
    },
  });

  let result = verifyDesktopBackupBundleJson(readOutput.json);
  if (!verifyOutput.validJson && result.status !== "corrupt") {
    result = {
      ...result,
      status: "corrupt",
      reason: "backup bundle JSON parse failed at host verification layer",
      bundle: null,
    };
  }

  return {
    result,
    path: verifyOutput.path,
    managedPath: verifyOutput.managedPath,
    byteSize: verifyOutput.bytes,
  };
}

async function resolveDependencies(): Promise<{
  repo: Repo<RepoRecord>;
  invoke: BackupInvoke;
  error?: DesktopBackupReport;
}> {
  if (!desktopBackupRuntimeEnabled || typeof window === "undefined") {
    return {
      repo: null as unknown as Repo<RepoRecord>,
      invoke: null as unknown as BackupInvoke,
      error: failReport({
        message: "desktop backup runtime is not active",
        code: "runtime_inactive",
      }),
    };
  }

  const invoke = resolveInvoke();
  if (!invoke) {
    return {
      repo: null as unknown as Repo<RepoRecord>,
      invoke: null as unknown as BackupInvoke,
      error: failReport({
        message: "desktop backup runtime invoke is unavailable",
        code: "invoke_unavailable",
      }),
    };
  }

  const repo = readDesktopRepoBridgeRepo();
  if (repo) {
    return { repo, invoke };
  }

  const fallbackRepo = createTauriRepo<RepoRecord>(invoke, {
    namespace: DESKTOP_REPO_NAMESPACE,
    schemaVersion: 1,
  });
  return {
    repo: fallbackRepo,
    invoke,
  };
}

function resolveInvoke(): BackupInvoke | null {
  const runtime = window as Window & {
    __TAURI_INTERNALS__?: {
      invoke?: BackupInvoke;
    };
  };
  return runtime.__TAURI_INTERNALS__?.invoke ?? null;
}

function toReportFromVerified(input: {
  verified: {
    result: ReturnType<typeof verifyDesktopBackupBundleJson>;
    path: string;
    managedPath: boolean;
    byteSize: number;
  };
  applyRequested: boolean;
  unresolvedTargetOutboxCount: number;
}): DesktopBackupReport {
  const { verified, applyRequested, unresolvedTargetOutboxCount } = input;
  if (verified.result.status === "failed") {
    return failReport({
      message: verified.result.reason ?? "backup verification failed",
      code: "verify_failed",
      path: verified.path,
      managedPath: verified.managedPath,
      applyRequested,
      restorableRecordCount: verified.result.restorableRecordCount,
      excludedRecordCount: verified.result.excludedRecordCount,
      unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
      unresolvedTargetOutboxCount,
      restorableFingerprint: verified.result.restorableFingerprint,
      byteSize: verified.byteSize,
    });
  }

  return {
    status: verified.result.status,
    path: verified.path,
    managedPath: verified.managedPath,
    applyRequested,
    warnings: verified.result.warnings,
    restorableRecordCount: verified.result.restorableRecordCount,
    excludedRecordCount: verified.result.excludedRecordCount,
    unresolvedSourceOutboxCount: verified.result.unresolvedOutboxCount,
    unresolvedTargetOutboxCount,
    restorableFingerprint: verified.result.restorableFingerprint,
    byteSize: verified.byteSize,
    error:
      verified.result.status === "corrupt" ||
      verified.result.status === "incompatible"
        ? {
            code: verified.result.status,
            message: verified.result.reason ?? "backup verification failed",
          }
        : undefined,
  };
}

function failReport(input: {
  message: string;
  code?: string;
  path?: string;
  managedPath?: boolean;
  applyRequested?: boolean;
  warnings?: string[];
  restorableRecordCount?: number;
  excludedRecordCount?: number;
  unresolvedSourceOutboxCount?: number;
  unresolvedTargetOutboxCount?: number;
  restorableFingerprint?: string;
  byteSize?: number;
}): DesktopBackupReport {
  return {
    status: "failed",
    path: input.path ?? null,
    managedPath: input.managedPath ?? false,
    applyRequested: input.applyRequested ?? false,
    warnings: input.warnings ?? [],
    restorableRecordCount: input.restorableRecordCount ?? 0,
    excludedRecordCount: input.excludedRecordCount ?? 0,
    unresolvedSourceOutboxCount: input.unresolvedSourceOutboxCount ?? 0,
    unresolvedTargetOutboxCount: input.unresolvedTargetOutboxCount ?? 0,
    restorableFingerprint: input.restorableFingerprint ?? "",
    byteSize: input.byteSize ?? 0,
    error: {
      code: input.code ?? "failed",
      message: input.message,
    },
  };
}

async function withRuntimeLock(
  fn: () => Promise<DesktopBackupReport>,
): Promise<DesktopBackupReport> {
  if (desktopBackupOperationActive) {
    const report = failReport({
      message: "another backup operation is already in progress",
      code: "busy",
    });
    lastDesktopBackupReport = report;
    return report;
  }

  desktopBackupOperationActive = true;
  try {
    return await fn();
  } finally {
    desktopBackupOperationActive = false;
  }
}

function asErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }
  if (typeof error === "string" && error.length > 0) {
    return error;
  }
  return fallback;
}
