import { Injectable } from '@angular/core';
import { ScanSoundType } from './env.service';

interface ToneStep {
  frequency: number;
  durationMs: number;
  delayMs?: number;
  wave?: OscillatorType;
}

@Injectable({
  providedIn: 'root',
})
export class ScanSoundService {
  private audioContext?: AudioContext;

  async play(type: ScanSoundType, volume: number): Promise<void> {
    if (type === 'off' || volume <= 0) return;

    try {
      const context = this.getAudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }

      const patterns: Record<Exclude<ScanSoundType, 'off'>, ToneStep[]> = {
        classic: [{ frequency: 1050, durationMs: 90, wave: 'sine' }],
        double: [
          { frequency: 900, durationMs: 55, wave: 'sine' },
          { frequency: 1250, durationMs: 65, delayMs: 85, wave: 'sine' },
        ],
        soft: [{ frequency: 650, durationMs: 125, wave: 'sine' }],
        high: [{ frequency: 1500, durationMs: 75, wave: 'triangle' }],
      };

      const safeVolume = Math.max(0, Math.min(100, volume)) / 100;
      for (const step of patterns[type]) {
        this.scheduleTone(context, step, safeVolume);
      }
    } catch {
      // Sound is optional feedback. Scanning must never fail because audio is
      // unavailable, muted by iOS or blocked by the current device state.
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private scheduleTone(context: AudioContext, step: ToneStep, volume: number): void {
    const start = context.currentTime + (step.delayMs ?? 0) / 1000;
    const end = start + step.durationMs / 1000;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = step.wave ?? 'sine';
    oscillator.frequency.setValueAtTime(step.frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.18), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.01);
  }
}
