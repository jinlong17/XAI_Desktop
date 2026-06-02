import type { WebModuleSlotRegistration } from "@repo/xai-web-shell";
import { useWebShell } from "@repo/xai-web-shell";
import { BookkeepingModule } from "./BookkeepingModule.js";

function BookkeepingModuleRoute() {
  const { lang } = useWebShell();
  return <BookkeepingModule lang={lang} />;
}

export const bookkeepingWebModuleRegistration: WebModuleSlotRegistration = {
  moduleId: "bookkeeping",
  label: "Bookkeeping",
  defaultChildPath: "",
  children: [
    { path: "", render: BookkeepingModuleRoute },
    { path: "*", render: BookkeepingModuleRoute },
  ],
  icon: "wallet",
  railOrder: 7.6,
  i18nKey: "nav.bookkeeping",
  showInRail: true,
};
