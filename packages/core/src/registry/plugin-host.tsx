import { PluginRegistry } from './plugin-registry';

/** Renders all registered plugin overlay layers in the main window */
export function OverlayHost() {
  const layers = PluginRegistry.getOverlayLayers();
  return (
    <>
      {layers.map((Layer, i) => (
        <Layer key={i} />
      ))}
    </>
  );
}

/** Renders all registered plugin widgets in the control window */
export function ControlHost() {
  const widgets = PluginRegistry.getControlWidgets();
  return (
    <>
      {widgets.map((Widget, i) => (
        <Widget key={i} />
      ))}
    </>
  );
}
