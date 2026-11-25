import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { MontageClipError } from './errors';
import { buildConcatArgs, buildNormalizeArgs, hasAudioStream } from './ffmpegArgs';

export type FFmpegLike = Pick<FFmpeg, 'on' | 'off' | 'writeFile' | 'deleteFile' | 'readFile' | 'exec' | 'terminate'>;
export type MontageClip = { name: string; data: Uint8Array; durationS: number; position: number };
export type MontageRun = (clips: MontageClip[], ass: string, onProgress?: (ratio: number) => void) => Promise<Blob>;

// Garde une seule instance d'ffmpeg tant que tout va bien. Après un échec (mémoire saturée, clip corrompu…),
// l'instance est arrêtée et le montage suivant repart d'une instance neuve.
export function createMontageRunner(load: () => Promise<FFmpegLike>): MontageRun {
  let instance: Promise<FFmpegLike> | null = null;

  return async function run(clips, ass, onProgress) {
    instance ??= load().catch((e) => {
      instance = null;
      throw e;
    });
    const ffmpeg = await instance;
    let log = '';
    const onLog = ({ message }: { message: string }) => {
      log += `${message}\n`;
    };
    ffmpeg.on('log', onLog);
    const files: string[] = [];
    try {
      const parts: string[] = [];
      for (const [i, clip] of clips.entries()) {
        await ffmpeg.writeFile(clip.name, clip.data);
        files.push(clip.name);
        log = '';
        await ffmpeg.exec(['-hide_banner', '-i', clip.name]); // lecture des pistes (code de sortie non nul attendu)
        const part = `part${i}.mp4`;
        const code = await ffmpeg.exec(buildNormalizeArgs(clip.name, part, hasAudioStream(log), clip.durationS));
        if (code !== 0) throw new MontageClipError(clip.position, 'read');
        files.push(part);
        parts.push(part);
        onProgress?.((i + 1) / (clips.length + 1));
      }
      await ffmpeg.writeFile('list.txt', parts.map((p) => `file '${p}'`).join('\n'));
      await ffmpeg.writeFile('subs.ass', ass);
      files.push('list.txt', 'subs.ass');
      const code = await ffmpeg.exec(buildConcatArgs('list.txt', 'subs.ass', '/fonts', 'episode.mp4'));
      if (code !== 0) throw new Error('Assemblage impossible');
      files.push('episode.mp4');
      const data = (await ffmpeg.readFile('episode.mp4')) as Uint8Array;
      onProgress?.(1);
      // Libère la mémoire du navigateur avant le prochain montage.
      for (const f of files) await ffmpeg.deleteFile(f).catch(() => {});
      return new Blob([new Uint8Array(data)], { type: 'video/mp4' });
    } catch (e) {
      ffmpeg.terminate();
      instance = null;
      throw e;
    } finally {
      ffmpeg.off('log', onLog);
    }
  };
}
