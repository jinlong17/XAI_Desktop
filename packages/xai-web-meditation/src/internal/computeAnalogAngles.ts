/**
 * @internal — computeAnalogAngles.ts
 *
 * Compute the rotation angles (in degrees, clockwise from 12 o'clock)
 * for an analog clock's hour / minute / second hands at a given Date.
 *
 * Used by the analog variant of <ClockDisplay>. Pure function.
 */

export function computeAnalogAngles(now: Date): { h: number; m: number; s: number } {
  return {
    h: ((now.getHours() % 12) + now.getMinutes() / 60) * 30,
    m: (now.getMinutes() + now.getSeconds() / 60) * 6,
    s: now.getSeconds() * 6,
  };
}
