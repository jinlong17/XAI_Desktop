import { useCallback, useEffect, useRef, useState } from "react";
import { accountScope } from "@repo/plugin-web-storage";
import type { AmbientSoundId } from "../types.js";

interface AmbientGraph {
  sound: AmbientSoundId;
  output: GainNode;
  stop: () => void;
  setVolume: (volume: number) => void;
  setDeadline: (deadline: number | null) => void;
}

interface AmbientState {
  available: boolean;
  error: string | null;
  playing: boolean;
  sound: AmbientSoundId;
}

type AudioContextCtor = new () => AudioContext;

let playbackRevision = 0;
let cancelResume: (() => void) | null = null;
let activeGraph: AmbientGraph | null = null;
let activeContext: AudioContext | null = null;

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const audioWindow = window as Window & {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return audioWindow.AudioContext ?? audioWindow.webkitAudioContext ?? null;
}

function canUseAudio(): boolean {
  return getAudioContextCtor() !== null;
}

function getAudioContext(): AudioContext | null {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  if (!activeContext || activeContext.state === "closed") {
    activeContext = new Ctor();
  }
  return activeContext;
}

function createNoiseSource(ctx: AudioContext, seconds = 2): AudioBufferSourceNode {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = (white * 0.55 + last * 3.5) * 0.24;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function connectFilteredNoise(
  ctx: AudioContext,
  output: AudioNode,
  options: { highpass?: number; lowpass?: number; bandpass?: number; gain: number },
): AudioBufferSourceNode {
  const source = createNoiseSource(ctx);
  let node: AudioNode = source;

  if (options.highpass) {
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = options.highpass;
    node.connect(highpass);
    node = highpass;
  }

  if (options.lowpass) {
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = options.lowpass;
    node.connect(lowpass);
    node = lowpass;
  }

  if (options.bandpass) {
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = options.bandpass;
    bandpass.Q.value = 0.85;
    node.connect(bandpass);
    node = bandpass;
  }

  const gain = ctx.createGain();
  gain.gain.value = options.gain;
  node.connect(gain);
  gain.connect(output);
  source.start();
  return source;
}

function attachLfo(ctx: AudioContext, target: AudioParam, frequency: number, depth: number): OscillatorNode {
  const lfo = ctx.createOscillator();
  const gain = ctx.createGain();
  lfo.frequency.value = frequency;
  gain.gain.value = depth;
  lfo.connect(gain);
  gain.connect(target);
  lfo.start();
  return lfo;
}

function scheduleForestChirp(ctx: AudioContext, output: AudioNode): () => void {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;

  const chirp = (): void => {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200 + Math.random() * 1600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1800 + Math.random() * 2200, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(output);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
    const timer = setTimeout(chirp, 1200 + Math.random() * 2400);
    timers.add(timer);
  };

  const first = setTimeout(chirp, 500);
  timers.add(first);

  return () => {
    stopped = true;
    for (const timer of timers) clearTimeout(timer);
  };
}

function scheduleThunder(ctx: AudioContext, output: AudioNode): () => void {
  const timers = new Set<ReturnType<typeof setTimeout>>();
  let stopped = false;

  const strike = (): void => {
    if (stopped) return;
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = "sine";
    rumble.frequency.setValueAtTime(42, ctx.currentTime);
    rumble.frequency.exponentialRampToValueAtTime(27, ctx.currentTime + 1.4);
    rumbleGain.gain.setValueAtTime(0.0001, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + 0.08);
    rumbleGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);
    rumble.connect(rumbleGain);
    rumbleGain.connect(output);
    rumble.start();
    rumble.stop(ctx.currentTime + 3);

    const timer = setTimeout(strike, 7000 + Math.random() * 8000);
    timers.add(timer);
  };

  const first = setTimeout(strike, 1200);
  timers.add(first);

  return () => {
    stopped = true;
    for (const timer of timers) clearTimeout(timer);
  };
}

function buildGraph(ctx: AudioContext, sound: AmbientSoundId, volume: number): AmbientGraph | null {
  if (sound === "none") return null;

  const output = ctx.createGain();
  output.gain.value = clampVolume(volume) * 0.75;
  output.connect(ctx.destination);

  const stopFns: Array<() => void> = [];
  const sources: Array<AudioBufferSourceNode | OscillatorNode> = [];

  const stopGraph = () => {
    for (const stop of stopFns) stop();
    for (const source of sources) { try { source.stop(); } catch { /* Already stopped. */ } }
    output.disconnect();
  };
  try {
  if (sound === "water") {
    sources.push(connectFilteredNoise(ctx, output, { highpass: 180, lowpass: 2400, bandpass: 620, gain: 0.34 }));
    sources.push(connectFilteredNoise(ctx, output, { highpass: 80, lowpass: 900, gain: 0.18 }));
  } else if (sound === "rain") {
    sources.push(connectFilteredNoise(ctx, output, { highpass: 1200, lowpass: 7800, gain: 0.24 }));
    sources.push(connectFilteredNoise(ctx, output, { highpass: 600, lowpass: 4200, gain: 0.12 }));
  } else if (sound === "waves") {
    const waveGain = ctx.createGain();
    waveGain.gain.value = 0.22;
    waveGain.connect(output);
    sources.push(connectFilteredNoise(ctx, waveGain, { lowpass: 560, gain: 0.42 }));
    const lfo = attachLfo(ctx, waveGain.gain, 0.08, 0.18);
    sources.push(lfo);
  } else if (sound === "thunder") {
    sources.push(connectFilteredNoise(ctx, output, { lowpass: 260, gain: 0.13 }));
    stopFns.push(scheduleThunder(ctx, output));
  } else if (sound === "forest") {
    sources.push(connectFilteredNoise(ctx, output, { highpass: 500, lowpass: 3600, gain: 0.12 }));
    stopFns.push(scheduleForestChirp(ctx, output));
  } else if (sound === "whiteNoise") {
    sources.push(connectFilteredNoise(ctx, output, { highpass: 120, lowpass: 9200, gain: 0.28 }));
  }

  } catch (error) { stopGraph(); throw error; }

  let deadline: number | null = null;
  const scheduleSilence = () => {
    if (deadline !== null) output.gain.setValueAtTime(0, ctx.currentTime + Math.max(0, deadline - Date.now()) / 1000);
  };
  return {
    sound,
    output,
    setDeadline: next => {
      deadline = next;
      output.gain.cancelScheduledValues(ctx.currentTime);
      output.gain.setValueAtTime(clampVolume(volume) * 0.75, ctx.currentTime);
      scheduleSilence();
    },
    setVolume: (nextVolume: number) => {
      volume = nextVolume;
      output.gain.setTargetAtTime(clampVolume(nextVolume) * 0.75, ctx.currentTime, 0.04);
      scheduleSilence();
    },
    stop: stopGraph,
  };
}

async function startAmbient(sound: AmbientSoundId, volume: number, getDeadline: () => number | null): Promise<boolean> {
  stopAmbient();
  const revision = playbackRevision;
  if (sound === "none") return true;
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      const resumed = await new Promise<boolean>(resolve => {
        let finished = false;
        const finish = (ok: boolean) => {
          if (finished) return; finished = true; clearTimeout(timeout);
          if (cancelResume === cancel) cancelResume = null;
          resolve(ok);
        };
        const cancel = () => finish(false);
        const timeout = setTimeout(cancel, 4000);
        cancelResume = cancel;
        try { void ctx.resume().then(() => finish(true), cancel); } catch { cancel(); }
      });
      if (!resumed) return false;
    }
    if (revision !== playbackRevision || ctx.state !== "running") return false;
    activeGraph = buildGraph(ctx, sound, volume);
    activeGraph?.setDeadline(getDeadline());
    return activeGraph !== null;
  } catch {
    if (revision === playbackRevision) stopAmbient();
    return false;
  }
}

function stopAmbient(): void {
  playbackRevision++;
  cancelResume?.();
  const graph = activeGraph;
  activeGraph = null;
  try { graph?.stop(); } catch { /* Graph is already detached. */ }
}

function setAmbientVolume(volume: number): void {
  activeGraph?.setVolume(volume);
}

export function useAmbientAudio(): {
  state: AmbientState;
  play: (sound: AmbientSoundId, volume: number) => Promise<boolean>;
  pause: () => void;
  setVolume: (volume: number) => void;
  setDeadline: (deadline: number | null) => void;
} {
  const [state, setState] = useState<AmbientState>({
    available: canUseAudio(),
    error: null,
    playing: false,
    sound: "none",
  });

  const request = useRef(0);
  const deadline = useRef<number | null>(null);
  const pause = useCallback((): void => {
    request.current++;
    stopAmbient();
    setState((current) => ({ ...current, playing: false }));
  }, []);

  const play = useCallback(async (sound: AmbientSoundId, volume: number): Promise<boolean> => {
    const current = ++request.current;
    const scope = accountScope.capture();
    const ok = await startAmbient(sound, volume, () => deadline.current);
    if (current !== request.current || accountScope.capture() !== scope) return false;
    setState({
      available: canUseAudio(),
      error: ok ? null : "Audio could not start. Check browser sound permission and retry playback.",
      playing: ok && sound !== "none",
      sound,
    });
    return ok;
  }, []);

  const setVolume = useCallback((volume: number): void => {
    setAmbientVolume(volume);
  }, []);

  const setDeadline = useCallback((next: number | null): void => {
    deadline.current = next;
    activeGraph?.setDeadline(next);
  }, []);

  useEffect(() => {
    const currentRequest = request;
    const unsubscribe = accountScope.subscribe(pause);
    return () => { unsubscribe(); currentRequest.current++; stopAmbient(); };
  }, [pause]);

  return { state, play, pause, setVolume, setDeadline };
}
