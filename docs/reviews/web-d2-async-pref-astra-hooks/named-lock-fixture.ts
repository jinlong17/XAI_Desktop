/** Deterministic test-only Web Locks subset: named FIFO queues with shared cohorts.
 * Native receiver/locking behavior is verified separately in browser evidence.
 */
export type TestLockRun = () => unknown | Promise<unknown>;
export function createTestLockManager(
  datasetRun: (name: string, run: TestLockRun) => unknown | Promise<unknown> = (_name, run) => run(),
) {
  type Job = { mode: LockMode; enter: () => void };
  const states = new Map<string, { readers: number; writer: boolean; queue: Job[] }>();
  const pending = new Set<Promise<unknown>>();
  const calls: Array<{ name: string; mode: LockMode }> = [];
  function request<T>(name: string, options: LockOptions | (() => T | Promise<T>), callback?: () => T | Promise<T>): Promise<T> {
    const mode = typeof options === 'function' ? 'exclusive' : options.mode ?? 'exclusive';
    const run = typeof options === 'function' ? options : callback!;
    calls.push({ name, mode });
    let state = states.get(name);
    if (!state) { state = { readers: 0, writer: false, queue: [] }; states.set(name, state); }
    const current = state;
    const drain = () => {
      while (current.queue.length && !current.writer) {
        const job = current.queue[0]!;
        if (job.mode === 'exclusive' && current.readers) return;
        current.queue.shift(); job.enter();
        if (job.mode === 'exclusive') return;
      }
    };
    const result = new Promise<T>((resolve, reject) => {
      current.queue.push({ mode, enter: () => {
        if (mode === 'shared') current.readers++; else current.writer = true;
        const release = () => { if (mode === 'shared') current.readers--; else current.writer = false; drain(); };
        let outcome: unknown;
        try { outcome = name.endsWith(':lifecycle') ? run() : datasetRun(name, run); }
        catch (error) { release(); reject(error); return; }
        Promise.resolve(outcome).then(value => { release(); resolve(value as T); }, error => { release(); reject(error); });
      }});
      drain();
    });
    pending.add(result);
    void result.then(() => pending.delete(result), () => pending.delete(result));
    return result;
  }
  return { request, calls, async idle() { while (pending.size) await Promise.allSettled([...pending]); } };
}
