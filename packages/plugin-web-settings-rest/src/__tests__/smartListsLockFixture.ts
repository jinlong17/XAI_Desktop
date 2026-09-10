type LockMode = "shared" | "exclusive";
type LockRun = () => unknown | Promise<unknown>;

/** Small deterministic Web Locks fixture for Smart Lists caller recovery tests. */
export function createSmartListsLockManager() {
  type Job = { readonly mode: LockMode; readonly enter: () => void };
  const states = new Map<string, { readers: number; writer: boolean; queue: Job[] }>();
  const request = <T>(name: string, options: { mode?: LockMode }, run: LockRun): Promise<T> => {
    let state = states.get(name);
    if (!state) {
      state = { readers: 0, writer: false, queue: [] };
      states.set(name, state);
    }
    const current = state;
    const drain = () => {
      while (current.queue.length && !current.writer) {
        const job = current.queue[0]!;
        if (job.mode === "exclusive" && current.readers) return;
        current.queue.shift();
        job.enter();
        if (job.mode === "exclusive") return;
      }
    };
    return new Promise<T>((resolve, reject) => {
      const mode = options.mode ?? "exclusive";
      current.queue.push({ mode, enter: () => {
        if (mode === "shared") current.readers += 1;
        else current.writer = true;
        const release = () => {
          if (mode === "shared") current.readers -= 1;
          else current.writer = false;
          drain();
        };
        Promise.resolve().then(run).then(
          value => { release(); resolve(value as T); },
          error => { release(); reject(error); },
        );
      }});
      drain();
    });
  };
  return { request };
}
