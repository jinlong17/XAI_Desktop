/** Deterministic Web Locks subset for tests: named FIFO queues with shared cohorts. */
export function createTestLockManager() {
  type Job = { mode: LockMode; enter: () => void };
  const states = new Map<string, { readers: number; writer: boolean; queue: Job[] }>();
  const calls: Array<{ name: string; mode: LockMode }> = [];

  function request<T>(
    name: string,
    optionsOrCallback: LockOptions | (() => T | Promise<T>),
    maybeCallback?: () => T | Promise<T>,
  ): Promise<T> {
    const mode = typeof optionsOrCallback === "function" ? "exclusive" : optionsOrCallback.mode ?? "exclusive";
    const callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
    if (!callback) return Promise.reject(new TypeError("Web Locks callback is required"));
    calls.push({ name, mode });

    let state = states.get(name);
    if (!state) {
      state = { readers: 0, writer: false, queue: [] };
      states.set(name, state);
    }
    const current = state;
    const drain = () => {
      while (current.queue.length > 0 && !current.writer) {
        const job = current.queue[0]!;
        if (job.mode === "exclusive" && current.readers > 0) return;
        current.queue.shift();
        job.enter();
        if (job.mode === "exclusive") return;
      }
    };

    return new Promise<T>((resolve, reject) => {
      current.queue.push({
        mode,
        enter: () => {
          if (mode === "shared") current.readers += 1;
          else current.writer = true;
          const release = () => {
            if (mode === "shared") current.readers -= 1;
            else current.writer = false;
            drain();
          };
          let result: T | Promise<T>;
          try {
            result = callback();
          } catch (error) {
            release();
            reject(error);
            return;
          }
          void Promise.resolve(result).then(
            (value) => { release(); resolve(value); },
            (error: unknown) => { release(); reject(error); },
          );
        },
      });
      drain();
    });
  }

  return { request, calls };
}
