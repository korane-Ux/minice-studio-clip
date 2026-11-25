// Sous-titres ASS : dialogues en bas, leçon au centre pendant les 3 dernières secondes.
export function assTime(seconds: number): string {
  const cs = Math.round(seconds * 100);
  const h = Math.floor(cs / 360000);
  const m = Math.floor((cs % 360000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  const c = cs % 100;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
}

function escapeAss(text: string): string {
  return text.replace(/\{/g, '(').replace(/\}/g, ')').replace(/\r?\n/g, '\\N').trim();
}

const HEADER = `[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Poppins,46,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,0,2,50,50,170,1
Style: Lecon,Poppins,58,&H00FFFFFF,&H00FFFFFF,&H002C180C,&HA0000000,-1,0,0,0,100,100,0,0,3,18,0,5,70,70,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

export function buildAss(scenes: { startS: number; durationS: number; dialogue: string }[], lesson: string): string {
  const lines = scenes
    .filter((s) => s.dialogue.trim())
    .map((s) => `Dialogue: 0,${assTime(s.startS)},${assTime(s.startS + s.durationS)},Default,,0,0,0,,${escapeAss(s.dialogue)}`);
  const total = scenes.reduce((max, s) => Math.max(max, s.startS + s.durationS), 0);
  if (lesson.trim() && total > 0) {
    lines.push(`Dialogue: 0,${assTime(Math.max(0, total - 3))},${assTime(total)},Lecon,,0,0,0,,${escapeAss(lesson)}`);
  }
  return `${HEADER}\n${lines.join('\n')}\n`;
}
