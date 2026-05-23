import React, { useState } from 'react';
import { useWebEventListener } from '../listener';
import type { WebEventMap } from '../events';

interface Props {
  onReceive?: (payload: WebEventMap['web:shell:module-change']) => void;
}

/**
 * Minimal test fixture that listens on web:shell:module-change.
 * Used by cross-package smoke tests to simulate a "Module B" listener.
 */
export function ListenerFixture({ onReceive }: Props) {
  const [lastModuleId, setLastModuleId] = useState<string | null>(null);

  useWebEventListener('web:shell:module-change', (p) => {
    setLastModuleId(p.moduleId);
    onReceive?.(p);
  });

  return (
    <div data-testid="listener" data-module-id={lastModuleId ?? ''}>
      {lastModuleId ?? 'none'}
    </div>
  );
}
