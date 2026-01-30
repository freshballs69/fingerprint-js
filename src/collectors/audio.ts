import { murmur3 } from '../utils/hash';

export async function getAudioFingerprint(): Promise<number> {
  try {
    const AudioContext = window.AudioContext || (window as Window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return 0;

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    const destination = context.destination;

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, context.currentTime);

    gain.gain.setValueAtTime(0, context.currentTime);

    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(destination);

    oscillator.start(0);

    const fingerprint = await new Promise<number>((resolve) => {
      const frequencyData = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(frequencyData);

      const dataString = frequencyData.slice(0, 50).join(',');
      resolve(murmur3(dataString));
    });

    oscillator.disconnect();
    analyser.disconnect();
    scriptProcessor.disconnect();
    gain.disconnect();
    context.close();

    return fingerprint;
  } catch {
    return 0;
  }
}
