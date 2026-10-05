/**
 * Zero-dependency Web Audio API synthesizer for tactile camera feedback
 */

class CameraAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Crisp tactile dial click when turning aperture/shutter/ISO
   */
  public playDialClick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.015);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch {
      // Audio playback failed or blocked by policy
    }
  }

  /**
   * Authentic dual-curtain focal plane mechanical shutter click
   */
  public playShutterSound(shutterSeconds: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Curtain 1: opening snap
      const playCurtainSnap = (time: number, freq: number, duration: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBuffer.length; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(freq, time);
        noiseFilter.Q.setValueAtTime(3.0, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(gain);
        gain.connect(this.ctx.destination);

        whiteNoise.start(time);
        whiteNoise.stop(time + duration);

        // Sub thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.04);
        const subGain = this.ctx.createGain();
        subGain.gain.setValueAtTime(0.25, time);
        subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
        osc.connect(subGain);
        subGain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
      };

      // Shutter opening click
      playCurtainSnap(now, 1600, 0.035);

      // Shutter closing click (delayed by shutter speed, clamped for audibility)
      const delay = Math.max(0.04, Math.min(shutterSeconds, 0.5));
      playCurtainSnap(now + delay, 1200, 0.04);
    } catch {
      // Audio playback failed
    }
  }

  /**
   * Autofocus lock confirmation double-beep
   */
  public playAfBeep() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const playChirp = (time: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2400, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.05);
      };

      playChirp(now);
      playChirp(now + 0.07);
    } catch {
      // Audio playback failed
    }
  }
}

export const cameraAudio = new CameraAudio();
