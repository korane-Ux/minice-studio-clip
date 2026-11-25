// Arguments ffmpeg du montage : sortie verticale 720x1280, 30 i/s, H.264 + AAC.
const VIDEO_FILTER = 'scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,setsar=1,fps=30';
const H264 = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p'];
const AAC = ['-c:a', 'aac', '-ar', '44100', '-ac', '2'];

// Chaque clip est ramené au même format ; une piste muette est ajoutée s'il n'a pas de son,
// pour que l'assemblage (concat) reçoive partout une vidéo et un audio identiques.
// Il dure exactement la durée prévue par le script (les sous-titres sont calés dessus) :
// trop long, il est coupé ; trop court, sa dernière image est prolongée et le son complété par du silence.
export function buildNormalizeArgs(input: string, output: string, hasAudio: boolean, durationS: number): string[] {
  const d = String(durationS);
  const vf = `${VIDEO_FILTER},tpad=stop_mode=clone:stop_duration=${d}`;
  if (hasAudio) return ['-i', input, '-map', '0:v:0', '-map', '0:a:0', '-vf', vf, '-af', 'apad', ...H264, ...AAC, '-t', d, output];
  return [
    '-i', input,
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-map', '0:v:0', '-map', '1:a:0',
    '-vf', vf, ...H264, ...AAC,
    '-t', d, output,
  ];
}

export function buildConcatArgs(listFile: string, assFile: string, fontsDir: string, output: string): string[] {
  return ['-f', 'concat', '-safe', '0', '-i', listFile, '-vf', `subtitles=${assFile}:fontsdir=${fontsDir}`, ...H264, ...AAC, '-movflags', '+faststart', output];
}

export function hasAudioStream(ffmpegLog: string): boolean {
  return /Stream #\d+:\d+.*: Audio:/.test(ffmpegLog);
}
