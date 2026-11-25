'use client';
import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { createMontageRunner } from './runner';

// ffmpeg.wasm 0.12.15 (build UMD copiée dans public/ffmpeg, car Turbopack ne sait pas empaqueter son worker)
// et cœur mono-thread 0.12.10 (pas besoin d'en-têtes COOP/COEP).
const CORE_BASE = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';

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

async function loadFFmpeg(): Promise<FFmpeg> {
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
}

export const runMontage = createMontageRunner(loadFFmpeg);
