let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function playNotificationSound() {
  try {
    const ctx = getAudioContext();

    const oscillator = ctx.createOscillator();

    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.start(ctx.currentTime);

    oscillator.stop(ctx.currentTime + 0.5);
  } catch (err) {
    console.warn("Notification sound failed: ", err);
  }
}
