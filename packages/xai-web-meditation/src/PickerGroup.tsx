/**
 * <PickerGroup> — presentational wrapper for a labeled picker section.
 *
 * 5-LOC component; identical to the prototype's PickerGroup.
 */

import type { JSX, ReactNode } from "react";

export interface PickerGroupProps {
  title: string;
  children: ReactNode;
}

export function PickerGroup({ title, children }: PickerGroupProps): JSX.Element {
  return (
    <div className="picker-group">
      <h3 className="picker-h">{title}</h3>
      {children}
    </div>
  );
}
