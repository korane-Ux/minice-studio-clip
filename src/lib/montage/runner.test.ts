import { expect, test, vi } from 'vitest';
import { MontageClipError, montageErrorMessage } from './errors';
import { createMontageRunner, type FFmpegLike } from './runner';

function fakeFFmpeg(execImpl: (args: string[]) => Promise<number> | number = () => 0) {
  const ff = {
    on: vi.fn(),
    off: vi.fn(),
    writeFile: vi.fn(async () => true),
    deleteFile: vi.fn(async () => true),
    readFile: vi.fn(async () => new Uint8Array([1, 2, 3])),
    exec: vi.fn(async (args: string[]) => execImpl(args)),
    terminate: vi.fn(),
  };
  return ff as typeof ff & FFmpegLike;
}

const clip = (position: number, durationS = 6) => ({ name: `scene${position}.mp4`, data: new Uint8Array([position]), durationS, position });

test('montage réussi : chaque clip est ramené à sa durée prévue', async () => {
  const ff = fakeFFmpeg();
  const run = createMontageRunner(async () => ff);
  const out = await run([clip(1, 6), clip(2, 4)], 'ass', () => {});
  expect(out.type).toBe('video/mp4');
  const normalize = ff.exec.mock.calls.map(([a]) => a).filter((a) => a.includes('-vf') && !a.includes('concat'));
  expect(normalize.map((a) => a[a.indexOf('-t') + 1])).toEqual(['6', '4']);
});

test('un clip illisible est signalé avec le numéro de sa scène', async () => {
  const ff = fakeFFmpeg((args) => (args.at(-1) === 'part1.mp4' ? 1 : 0));
  const run = createMontageRunner(async () => ff);
  const err = await run([clip(1), clip(3)], 'ass', () => {}).catch((e) => e);
  expect(err).toBeInstanceOf(MontageClipError);
  expect(err.position).toBe(3);
  expect(montageErrorMessage(err)).toBe("Le clip de la scène 3 n'a pas pu être lu. Remplace-le, puis relance le montage.");
});

test('après un échec, ffmpeg est arrêté puis rechargé au montage suivant', async () => {
  const first = fakeFFmpeg(() => {
    throw new Error('memory access out of bounds');
  });
  const second = fakeFFmpeg();
  const load = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
  const run = createMontageRunner(load);

  await expect(run([clip(1)], 'ass', () => {})).rejects.toThrow();
  expect(first.terminate).toHaveBeenCalled();

  await run([clip(1)], 'ass', () => {});
  expect(load).toHaveBeenCalledTimes(2);
});

test('montage réussi : ffmpeg est gardé pour le suivant', async () => {
  const ff = fakeFFmpeg();
  const load = vi.fn().mockResolvedValue(ff);
  const run = createMontageRunner(load);
  await run([clip(1)], 'ass', () => {});
  await run([clip(1)], 'ass', () => {});
  expect(load).toHaveBeenCalledTimes(1);
  expect(ff.terminate).not.toHaveBeenCalled();
});

test('messages d’erreur du montage', () => {
  expect(montageErrorMessage(new MontageClipError(2, 'download'))).toBe(
    "Le clip de la scène 2 n'a pas pu être téléchargé. Recharge la page, puis relance le montage.",
  );
  expect(montageErrorMessage(new Error('x'))).toBe('Le montage a échoué. Réessaie depuis un ordinateur.');
});
