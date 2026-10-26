import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Create directory
const audioDir = join(process.cwd(), 'public', 'audio');
mkdirSync(audioDir, { recursive: true });

function createWavBuffer(durationSec, generateSample) {
  const sampleRate = 44100;
  const numChannels = 2;
  const bytesPerSample = 2;
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk 1 size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byte rate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const [left, right] = generateSample(t, i, numSamples);
    
    // Clamp to -1.0 .. 1.0 and convert to int16
    const clampedLeft = Math.max(-1, Math.min(1, left));
    const clampedRight = Math.max(-1, Math.min(1, right));

    const leftInt = Math.floor(clampedLeft < 0 ? clampedLeft * 32768 : clampedLeft * 32767);
    const rightInt = Math.floor(clampedRight < 0 ? clampedRight * 32768 : clampedRight * 32767);

    buffer.writeInt16LE(leftInt, offset);
    buffer.writeInt16LE(rightInt, offset + 2);
    offset += 4;
  }

  return buffer;
}

// 1. Ambient Drift (Gentle, warm melodic pad in D minor)
const ambient = createWavBuffer(12.0, (t, i, total) => {
  const env = Math.sin((Math.PI * i) / total); // envelope fade in and out
  const f1 = 146.83; // D3
  const f2 = 220.00; // A3
  const f3 = 261.63; // C4
  const f4 = 349.23; // F4
  
  const lfo = Math.sin(2 * Math.PI * 0.3 * t) * 0.2;
  const lfo2 = Math.cos(2 * Math.PI * 0.25 * t) * 0.2;

  const s1 = Math.sin(2 * Math.PI * (f1 + lfo) * t);
  const s2 = Math.sin(2 * Math.PI * (f2 - lfo) * t) * 0.6;
  const s3 = Math.sin(2 * Math.PI * (f3 + lfo2) * t) * 0.5;
  const s4 = Math.sin(2 * Math.PI * f4 * t) * 0.3;

  const mix = (s1 + s2 + s3 + s4) * 0.25 * env;
  return [mix * 0.9, mix * 1.0];
});
writeFileSync(join(audioDir, 'ambient-drift.wav'), ambient);
console.log('Created ambient-drift.wav (' + ambient.length + ' bytes)');

// 2. Cyber Pulse (Synthesized electronic arpeggio in A minor)
const cyber = createWavBuffer(10.0, (t, i, total) => {
  const env = Math.sin((Math.PI * i) / total);
  const notes = [220.00, 261.63, 329.63, 440.00, 392.00, 329.63, 261.63, 196.00];
  const step = Math.floor((t * 4) % notes.length);
  const freq = notes[step];
  
  const stepTime = (t * 4) % 1.0;
  const noteEnv = Math.exp(-stepTime * 3.5); // per-note decay

  const wave = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * freq * 2 * t);
  const sub = 0.4 * Math.sin(2 * Math.PI * (freq / 2) * t);
  const mix = (wave * noteEnv + sub) * 0.35 * env;

  return [mix * (step % 2 === 0 ? 0.8 : 1.0), mix * (step % 2 === 0 ? 1.0 : 0.8)];
});
writeFileSync(join(audioDir, 'cyber-pulse.wav'), cyber);
console.log('Created cyber-pulse.wav (' + cyber.length + ' bytes)');

// 3. Midnight Groove (Chill Lo-Fi Rhodes chord progression)
const groove = createWavBuffer(14.0, (t, i, total) => {
  const env = Math.sin((Math.PI * i) / total);
  // Chord progression: Fmaj7 (F3, A3, C4, E4) -> Em7 (E3, G3, B3, D4)
  const bar = Math.floor((t / 3.5) % 2);
  const chord = bar === 0 
    ? [174.61, 220.00, 261.63, 329.63] 
    : [164.81, 196.00, 246.94, 293.66];
  
  const chordTime = (t % 3.5);
  const chordEnv = Math.exp(-chordTime * 0.6);

  let tone = 0;
  for (const f of chord) {
    tone += Math.sin(2 * Math.PI * f * t) * 0.2;
    tone += Math.sin(2 * Math.PI * f * 2 * t) * 0.05;
  }

  // Soft low-fi vinyl tape flutter
  const wow = 1 + 0.003 * Math.sin(2 * Math.PI * 4 * t);
  tone = tone * wow;

  const mix = tone * chordEnv * 0.45 * env;
  return [mix * 0.95, mix * 1.05];
});
writeFileSync(join(audioDir, 'midnight-groove.wav'), groove);
console.log('Created midnight-groove.wav (' + groove.length + ' bytes)');
