/**
 * apps/admin/src/components/AdminUiContext.tsx — shared admin UI services.
 *
 * Provides `requestConfirm` (opens the type-to-confirm ConfirmModal) and `toast`
 * to all pages without prop-drilling. The destructive command adapter
 * (`../adapters/commands`) is exposed here so pages confirm against NO-OP mocks
 * (AC-4).
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
import { mockAdminCommandAdapter } from "../adapters/commands";
import type { AdminCommandAdapter } from "../adapters/types";

interface AdminUiContextValue {
  requestConfirm: (req: ConfirmRequest) => void;
  toast: (msg: string) => void;
  /** no-op command adapter (slice #1) — destructive flows resolve to no writes */
  commands: AdminCommandAdapter;
}

const AdminUiContext = createContext<AdminUiContextValue | undefined>(undefined);

export function AdminUiProvider({ children }: PropsWithChildren): React.ReactElement {
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const requestConfirm = useCallback((req: ConfirmRequest) => setConfirm(req), []);
  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2200);
  }, []);

  const value = useMemo<AdminUiContextValue>(
    () => ({ requestConfirm, toast, commands: mockAdminCommandAdapter }),
    [requestConfirm, toast],
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
