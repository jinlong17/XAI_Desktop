export interface AiCubeControlShellBridge {
  isPanelOpen: boolean;
  togglePanel(): void;
  closePanel(): void;
  startWindowDrag(): Promise<void>;
}

export interface AiCubeAppearanceBridge {
  cubeColor: string;
  cubeTextColor: string;
  cubeOpacity: number;
  cubeSize: number;
  cubeFontSize: number;
  gridOpacity: number;
  gridBlur: boolean;
  setCubeColor(value: string): void;
  setCubeTextColor(value: string): void;
  setCubeOpacity(value: number): void;
  setCubeSize(value: number): void;
  setCubeFontSize(value: number): void;
  setGridOpacity(value: number): void;
  setGridBlur(value: boolean): void;
}

export interface AiCubeTrayActions {
  createGrid(anchor: { x: number; y: number }): Promise<void>;
  clearAllGrids(): Promise<void>;
  openClipboard(): void;
  openPomodoro(): void;
  openSearch(): void;
  openPluginCenter(): void;
  openSettings(): void;
}

export interface AiCubeControlBridge {
  shell: AiCubeControlShellBridge;
  appearance: AiCubeAppearanceBridge;
  actions: AiCubeTrayActions;
}
