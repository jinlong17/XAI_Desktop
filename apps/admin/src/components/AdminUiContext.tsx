/**
 * apps/admin/src/components/AdminUiContext.tsx — shared admin UI services.
 *
 * Provides `requestConfirm` (opens the type-to-confirm ConfirmModal) and `toast`
 * to all pages without prop-drilling. The destructive command adapter is the
 * guarded fail-closed browser mock seam; pages never import command clients.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { ConfirmModal, type ConfirmRequest } from "./ConfirmModal";
import {
  createGuardedCommandAdapter,
  type GuardedCommandAdapter,
} from "../adapters/guardedCommands";
import type { AdminRole } from "../authz/rbac";

const MOCK_ROLE = import.meta.env.VITE_ADMIN_MOCK_ROLE as AdminRole | undefined;

/**
 * Row #4 command surface: all six admin command families are RBAC+audit-guarded
 * (AdminApiResult<MutationAck>). Pages keep calling useAdminUi().commands.<family>
 * unchanged.
 */
export type AdminCommands = GuardedCommandAdapter;

interface AdminUiContextValue {
  requestConfirm: (req: ConfirmRequest) => void;
  toast: (msg: string) => void;
  commands: AdminCommands;
}

const AdminUiContext = createContext<AdminUiContextValue | undefined>(undefined);

export function AdminUiProvider({
  children,
  commandsOverride,
}: PropsWithChildren<{
  commandsOverride?: Partial<AdminCommands>;
}>): React.ReactElement {
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const { commands: guarded } = useMemo(
    () => createGuardedCommandAdapter(MOCK_ROLE ? { role: MOCK_ROLE } : {}),
    [],
  );
  const baseCommands: AdminCommands = useMemo(
    () => ({
      banUser: guarded.banUser,
      bulkBan: guarded.bulkBan,
      transferOwnership: guarded.transferOwnership,
      setFeatureRollout: guarded.setFeatureRollout,
      setProviderRouting: guarded.setProviderRouting,
      setQuota: guarded.setQuota,
    }),
    [guarded],
  );

  const requestConfirm = useCallback((req: ConfirmRequest) => setConfirm(req), []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2200);
  }, []);
  const commands = useMemo<AdminCommands>(
    () => ({ ...baseCommands, ...commandsOverride }),
    [baseCommands, commandsOverride],
  );

  const value = useMemo<AdminUiContextValue>(
    () => ({ requestConfirm, toast, commands }),
    [requestConfirm, toast, commands],
  );

  return (
    <AdminUiContext.Provider value={value}>
      {children}
      <ConfirmModal request={confirm} onClose={() => setConfirm(null)} />
      {toastMsg ? (
        <div className="admin-toast" role="status">
          {toastMsg}
        </div>
      ) : null}
    </AdminUiContext.Provider>
  );
}

export function useAdminUi(): AdminUiContextValue {
  const v = useContext(AdminUiContext);
  if (!v) throw new Error("useAdminUi must be used within AdminUiProvider");
  return v;
}
