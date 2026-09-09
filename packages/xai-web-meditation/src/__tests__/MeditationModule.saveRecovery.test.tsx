import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { accountScope } from '@repo/plugin-web-storage';
import { MeditationModule } from '../MeditationModule';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const key = () => accountScope.physicalKey('xai_meditation_prefs');
function denyWrites() {
  const physical = key(), original = Storage.prototype.setItem;
  return vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, name, value) {
    if (name === physical) throw new DOMException('Synthetic quota', 'QuotaExceededError');
    original.call(this, name, value);
  });
}
function name(value: string) { fireEvent.change(screen.getByLabelText('Scene name'), { target: { value } }); }
function save() { fireEvent.click(screen.getByRole('button', { name: 'Save scene' })); }
function stored() { return JSON.parse(localStorage.getItem(key())!); }

describe('Meditation save recovery', () => {
  it('retains a failed new scene and retries the latest draft exactly once', () => {
    render(<MeditationModule lang="en" />);
    name('First draft'); const fault = denyWrites(); save();
    expect(localStorage.getItem(key())).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
    name('Latest draft');
    fireEvent.click(screen.getAllByRole('button', { name: 'New scene' })[0]!);
    expect(screen.getByLabelText('Scene name')).toHaveValue('Latest draft');
    fault.mockRestore();
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    expect(stored().customScenes).toHaveLength(1);
    expect(stored().customScenes[0].name).toBe('Latest draft');
    expect(stored().scene).toBe(stored().customScenes[0].id);
    save(); expect(stored().customScenes).toHaveLength(1);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('does not reset the editor or publish deletion until storage succeeds', () => {
    render(<MeditationModule lang="en" />); name('Saved scene'); save();
    name('Unsubmitted edit'); const before = localStorage.getItem(key());
    const fault = denyWrites(); fireEvent.click(screen.getByLabelText('Delete scene'));
    expect(localStorage.getItem(key())).toBe(before);
    expect(screen.getByLabelText('Scene name')).toHaveValue('Unsubmitted edit');
    expect(screen.getByRole('alert')).toHaveTextContent('Not saved');
    fault.mockRestore(); fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    expect(stored().customScenes).toEqual([]); expect(stored().scene).toBe('ocean');
  });

  it('protects a newer stored value from an old retry', () => {
    render(<MeditationModule lang="en" />); name('Pending');
    const fault = denyWrites(); save(); fault.mockRestore();
    const newer = JSON.stringify({ unrelated: 'newer-exact-bytes' });
    localStorage.setItem(key(), newer);
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    expect(localStorage.getItem(key())).toBe(newer);
    expect(screen.getByRole('alert')).toHaveTextContent('Newer stored data was preserved');
  });

  it('exports the latest scene editor plus failed proposal using a download', async () => {
    render(<MeditationModule lang="en" />); name('Failed draft');
    const fault = denyWrites(); save(); name('Latest exported draft');
    const create = vi.fn((blob: Blob) => { expect(blob.type).toBe('application/json'); return 'blob:meditation-draft'; });
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: create });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    let downloaded = '';
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloaded = this.download; });
    fireEvent.click(screen.getByRole('button', { name: 'Export draft' }));
    expect(downloaded).toBe('meditation-unsaved-draft.json');
    expect(create).toHaveBeenCalledOnce();
    const body = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result)); reader.onerror = reject;
      reader.readAsText(create.mock.calls[0]![0]);
    });
    const payload = JSON.parse(body);
    expect(payload.sceneDraft.name).toBe('Latest exported draft');
    expect(payload.snapshot.customScenes[0].name).toBe('Failed draft');
    fault.mockRestore();
  });

  it('rejects old account retry and export after switching identity', () => {
    render(<MeditationModule lang="en" />); name('A draft');
    const physicalA = key(), fault = denyWrites(); save(); fault.mockRestore();
    act(() => { accountScope.activate(accountScope.lock('B'), 'fixture'); });
    const physicalB = key();
    fireEvent.click(screen.getByRole('button', { name: 'Retry save' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export draft' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Export failed');
    expect(localStorage.getItem(physicalA)).toBeNull(); expect(localStorage.getItem(physicalB)).toBeNull();
  });
});
