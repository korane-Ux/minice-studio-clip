import { expect, test } from 'vitest';
import { buildConcatArgs, buildNormalizeArgs, hasAudioStream } from './ffmpegArgs';
import { assTime, buildAss } from './subtitles';

test('format des temps', () => {
  expect(assTime(0)).toBe('0:00:00.00');
  expect(assTime(8)).toBe('0:00:08.00');
  expect(assTime(61.5)).toBe('0:01:01.50');
});

test('temps et échappement des sous-titres', () => {
  const ass = buildAss(
    [{ startS: 0, durationS: 8, dialogue: 'Gaspard : « {Tout} ça, c’est à moi ! »\nBernard : « Oh. »' }],
    'Celui qui partage ne perd jamais rien.',
  );
  expect(ass).toContain('Dialogue: 0,0:00:00.00,0:00:08.00,Default,,0,0,0,,Gaspard : « (Tout) ça, c’est à moi ! »\\NBernard : « Oh. »');
  expect(ass).toContain('Dialogue: 0,0:00:05.00,0:00:08.00,Lecon,,0,0,0,,Celui qui partage ne perd jamais rien.');
  expect(ass).toContain('PlayResX: 720');
  expect(ass).toContain('PlayResY: 1280');
});

test('scène sans dialogue : pas de ligne de sous-titre', () => {
  const ass = buildAss(
    [
      { startS: 0, durationS: 8, dialogue: '' },
      { startS: 8, durationS: 8, dialogue: 'Gaspard : « Bernard ! »' },
    ],
    'Leçon',
  );
  expect(ass.match(/,Default,/g)).toHaveLength(1);
  expect(ass).toContain('Dialogue: 0,0:00:13.00,0:00:16.00,Lecon');
});

test('normalisation d’un clip sans audio', () => {
  const args = buildNormalizeArgs('s1.mov', 'n1.mp4', false);
  expect(args).toContain('anullsrc=channel_layout=stereo:sample_rate=44100');
  expect(args.join(' ')).toContain('scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280');
  expect(args).toContain('-shortest');
  expect(args.at(-1)).toBe('n1.mp4');
});

test('normalisation d’un clip avec audio', () => {
  const args = buildNormalizeArgs('s1.mp4', 'n1.mp4', true);
  expect(args).not.toContain('anullsrc=channel_layout=stereo:sample_rate=44100');
  expect(args.slice(0, 2)).toEqual(['-i', 's1.mp4']);
  expect(args).toContain('veryfast');
});

test('assemblage avec sous-titres', () => {
  const args = buildConcatArgs('list.txt', 'subs.ass', '/fonts', 'episode.mp4');
  expect(args.slice(0, 6)).toEqual(['-f', 'concat', '-safe', '0', '-i', 'list.txt']);
  expect(args).toContain('subtitles=subs.ass:fontsdir=/fonts');
  expect(args.at(-1)).toBe('episode.mp4');
});

test('détection de la piste audio dans le journal ffmpeg', () => {
  expect(hasAudioStream('  Stream #0:0[0x1](und): Video: h264\n  Stream #0:1[0x2](und): Audio: aac (LC), 44100 Hz')).toBe(true);
  expect(hasAudioStream('  Stream #0:0[0x1](und): Video: h264 (High)')).toBe(false);
});
