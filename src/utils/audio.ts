let audioElement: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

function fallbackBeep(): void {
  try {
    const AudioContextCtor = window.AudioContext;
    if (!AudioContextCtor) return;

    audioContext ??= new AudioContextCtor();
    if (audioContext.state === 'suspended') {
      void audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  } catch {
    return;
  }
}

export function playClickSfx(): void {
  try {
    audioElement ??= new Audio('/audio/ui-click.mp3');
    audioElement.currentTime = 0;
    void audioElement.play().catch(() => fallbackBeep());
  } catch {
    fallbackBeep();
  }
}
