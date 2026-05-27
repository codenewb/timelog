let context: AudioContext | undefined;

export function prepareAudio() {
  try {
    context ??= new AudioContext();
    void context.resume();
  } catch {
    // Keep the visible timer usable when Web Audio is unavailable.
  }
}

export function playCompletionTone() {
  try {
    context ??= new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.4);
  } catch {
    // Completion remains visible when Web Audio is unavailable.
  }
}
