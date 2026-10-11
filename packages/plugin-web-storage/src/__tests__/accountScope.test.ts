import { beforeEach, expect, it } from 'vitest';
import { createAccountScopeController, createScopedStorage, generationKey } from '../internal/accountScope.js';
beforeEach(() => localStorage.clear());
it('fails closed before authentication and never reads unowned legacy content', () => {
  localStorage.setItem('xai_ai_convos','private legacy');
  const controller=createAccountScopeController();
  expect(() => createScopedStorage(localStorage,controller).getItem('xai_ai_convos')).toThrow(/locked/);
  controller.activate(controller.lock('A'),'first');
  expect(createScopedStorage(localStorage,controller).getItem('xai_ai_convos')).toBeNull();
});
it('captures account ownership and rejects stale handles after switch', () => {
  const c=createAccountScopeController();
  c.activate(c.lock('A'),'first');
  const a=createScopedStorage(localStorage,c);
  a.setItem('xai_ai_convos','A private');
  a.setItem('xai_pref_theme','dark');
  c.activate(c.lock('B'),'first');
  const b=createScopedStorage(localStorage,c);
  expect(b.getItem('xai_ai_convos')).toBeNull();
  expect(b.getItem('xai_pref_theme')).toBe('dark');
  expect(() => a.setItem('xai_ai_convos','late A')).toThrow();
  expect(localStorage.getItem(generationKey('A','first','xai_ai_convos'))).toBe('A private');
});
it('rejects unclassified keys and isolates demo from live accounts', () => {
  const c=createAccountScopeController();
  c.activate(c.lock('A'),'first',true);
  createScopedStorage(localStorage,c).setItem('xai_ai_convos','demo');
  expect(() => createScopedStorage(localStorage,c).getItem('xai_unknown')).toThrow(/Unclassified/);
  c.activate(c.lock('A'),'first');
  expect(createScopedStorage(localStorage,c).getItem('xai_ai_convos')).toBeNull();
});
it('invalidates subscribers synchronously and rejects old transition activation', () => {
  const c=createAccountScopeController();
  const a=c.lock('A'); let observations=0;
  c.subscribe(() => { observations++; expect(c.capture().kind).toBe('locked'); });
  c.lock('B');
  expect(observations).toBe(1);
  expect(() => c.activate(a,'old')).toThrow();
});
