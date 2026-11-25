'use client';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { buildConcatArgs, buildNormalizeArgs, hasAudioStream } from './ffmpegArgs';

// ffmpeg.wasm 0.12.15 (build UMD copiée dans public/ffmpeg, car Turbopack ne sait pas empaqueter son worker)
// et cœur mono-thread 0.12.10 (pas besoin d'en-têtes COOP/COEP), chargés une seule fois.
const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
let instance: Promise<FFmpeg> | null = null;

declare global {
  interface Window {
    FFmpegWASM?: { FFmpeg: new () => FFmpeg };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FFmpegWASM) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Chargement impossible : ${src}`));
    document.head.appendChild(s);
  });
}

async function toBlobURL(url: string, type: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Téléchargement impossible : ${url}`);
  return URL.createObjectURL(new Blob([await res.arrayBuffer()], { type }));
}

async function getFFmpeg(): Promise<FFmpeg> {
  instance ??= (async () => {
    await loadScript('/ffmpeg/ffmpeg.js');
    const ffmpeg = new window.FFmpegWASM!.FFmpeg();
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    const font = new Uint8Array(await (await fetch('/fonts/Poppins-SemiBold.ttf')).arrayBuffer());
    await ffmpeg.createDir('/fonts');
    await ffmpeg.writeFile('/fonts/Poppins-SemiBold.ttf', font);
    return ffmpeg;
  })().catch((e) => {
    instance = null;
    throw e;
  });
  return instance;
}

export async function runMontage(clips: { name: string; data: Uint8Array }[], ass: string, onProgress?: (ratio: number) => void): Promise<Blob> {
  const ffmpeg = await getFFmpeg();
  let log = '';
  const onLog = ({ message }: { message: string }) => {
    log += `${message}\n`;
  };
  ffmpeg.on('log', onLog);
  try {
    const parts: string[] = [];
    for (const [i, clip] of clips.entries()) {
      await ffmpeg.writeFile(clip.name, clip.data);
      log = '';
      await ffmpeg.exec(['-hide_banner', '-i', clip.name]); // lecture des pistes (code de sortie non nul attendu)
      const part = `part${i}.mp4`;
      const code = await ffmpeg.exec(buildNormalizeArgs(clip.name, part, hasAudioStream(log)));
      if (code !== 0) throw new Error(`Normalisation du clip ${i + 1} impossible`);
      parts.push(part);
      onProgress?.((i + 1) / (clips.length + 1));
    }
    await ffmpeg.writeFile('list.txt', parts.map((p) => `file '${p}'`).join('\n'));
    await ffmpeg.writeFile('subs.ass', ass);
    const code = await ffmpeg.exec(buildConcatArgs('list.txt', 'subs.ass', '/fonts', 'episode.mp4'));
    if (code !== 0) throw new Error('Assemblage impossible');
    const data = (await ffmpeg.readFile('episode.mp4')) as Uint8Array;
    onProgress?.(1);
    return new Blob([new Uint8Array(data)], { type: 'video/mp4' });
  } finally {
    ffmpeg.off('log', onLog);
  }
}
