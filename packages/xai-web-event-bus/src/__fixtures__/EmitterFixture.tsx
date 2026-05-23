import React from 'react';
import { emitWebEvent } from '../emitter';

interface Props {
  onEmit?: () => void;
}

/**
 * Minimal test fixture that emits a web:shell:module-change event on click.
 * Used by cross-package smoke tests to simulate a "Module A" emitter.
 */
export function EmitterFixture({ onEmit }: Props) {
  const handleClick = () => {
    emitWebEvent('web:shell:module-change', {
      moduleId: 'calendar',
      source: 'programmatic',
    });
    onEmit?.();
  };

  return (
    <button type="button" data-testid="emitter" onClick={handleClick}>
      Emit
    </button>
  );
}
