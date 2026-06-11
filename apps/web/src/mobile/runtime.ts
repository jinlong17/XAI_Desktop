export type MobileRuntimeProbe = {
  userAgent: string;
  maxTouchPoints: number;
  standalone: boolean;
  displayModeStandalone: boolean;
  capacitorNative: boolean;
};

export type MobileRuntimeFlags = {
  isMobileLike: boolean;
  isStandalone: boolean;
  isCapacitor: boolean;
};

type CapacitorWindow = typeof window & {
  Capacitor?: {
    isNativePlatform?: () => boolean;
  };
};

export function getBrowserMobileRuntimeProbe(): MobileRuntimeProbe {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const capacitorNative = Boolean((window as CapacitorWindow).Capacitor?.isNativePlatform?.());

  return {
    userAgent: window.navigator.userAgent,
    maxTouchPoints: window.navigator.maxTouchPoints,
    standalone: Boolean(nav.standalone),
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
    capacitorNative,
  };
}

export function getMobileRuntimeFlags(probe: MobileRuntimeProbe): MobileRuntimeFlags {
  const ua = probe.userAgent.toLowerCase();
  const isMobileLike = probe.maxTouchPoints > 1 || /iphone|ipad|android|mobile/.test(ua);
  const isStandalone = probe.standalone || probe.displayModeStandalone || probe.capacitorNative;

  return {
    isMobileLike,
    isStandalone,
    isCapacitor: probe.capacitorNative,
  };
}

export function applyMobileRuntimeAttributes(
  target: HTMLElement,
  flags: MobileRuntimeFlags
) {
  target.dataset.mobileLike = String(flags.isMobileLike);
  target.dataset.mobileStandalone = String(flags.isStandalone);
  target.dataset.mobileCapacitor = String(flags.isCapacitor);
}
