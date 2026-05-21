import { describe, it, expect } from 'vitest';
import { canTransition, nextState } from './stateMachine.js';

describe('canTransition', () => {
  // Valid forward transitions in the lifecycle: idle → remind → interact → rest → idle
  it('allows idle → remind', () => {
    expect(canTransition('idle', 'remind')).toBe(true);
  });

  it('allows remind → interact', () => {
    expect(canTransition('remind', 'interact')).toBe(true);
  });

  it('allows interact → rest', () => {
    expect(canTransition('interact', 'rest')).toBe(true);
  });

  it('allows rest → idle', () => {
    expect(canTransition('rest', 'idle')).toBe(true);
  });

  // Self-transitions are always allowed
  it('allows idle → idle (self-transition)', () => {
    expect(canTransition('idle', 'idle')).toBe(true);
  });

  it('allows remind → remind (self-transition)', () => {
    expect(canTransition('remind', 'remind')).toBe(true);
  });

  it('allows interact → interact (self-transition)', () => {
    expect(canTransition('interact', 'interact')).toBe(true);
  });

  it('allows rest → rest (self-transition)', () => {
    expect(canTransition('rest', 'rest')).toBe(true);
  });

  // Additional valid transitions defined in TRANSITIONS
  it('allows idle → interact', () => {
    expect(canTransition('idle', 'interact')).toBe(true);
  });

  it('allows idle → rest', () => {
    expect(canTransition('idle', 'rest')).toBe(true);
  });

  it('allows remind → idle', () => {
    expect(canTransition('remind', 'idle')).toBe(true);
  });

  it('allows interact → idle', () => {
    expect(canTransition('interact', 'idle')).toBe(true);
  });

  // Invalid transitions
  it('blocks rest → interact (invalid)', () => {
    expect(canTransition('rest', 'interact')).toBe(false);
  });

  it('blocks rest → remind (invalid)', () => {
    expect(canTransition('rest', 'remind')).toBe(false);
  });

  it('blocks interact → remind (invalid)', () => {
    expect(canTransition('interact', 'remind')).toBe(false);
  });

  it('blocks remind → rest (invalid)', () => {
    expect(canTransition('remind', 'rest')).toBe(false);
  });
});

describe('nextState', () => {
  it('returns target state for a valid transition', () => {
    expect(nextState('idle', 'remind')).toBe('remind');
  });

  it('returns target state for remind → interact', () => {
    expect(nextState('remind', 'interact')).toBe('interact');
  });

  it('returns target state for interact → rest', () => {
    expect(nextState('interact', 'rest')).toBe('rest');
  });

  it('returns target state for rest → idle', () => {
    expect(nextState('rest', 'idle')).toBe('idle');
  });

  it('stays at current state on invalid transition (rest → interact)', () => {
    expect(nextState('rest', 'interact')).toBe('rest');
  });

  it('stays at current state on invalid transition (remind → rest)', () => {
    expect(nextState('remind', 'rest')).toBe('remind');
  });

  it('stays at current state on invalid transition (interact → remind)', () => {
    expect(nextState('interact', 'remind')).toBe('interact');
  });

  it('returns same state for self-transition', () => {
    expect(nextState('idle', 'idle')).toBe('idle');
    expect(nextState('rest', 'rest')).toBe('rest');
  });
});
