import type { AccountRow, AccountStyle, CharacterRow, EpisodeRow, LessonFormat, SceneRow } from '@/lib/db/types';
import type { EpisodeStatus } from './status';

export type { AccountStyle, LessonFormat };

export type Account = {
  id: string;
  name: string;
  color: string;
  tiktokHandle: string | null;
  style: AccountStyle;
  contentFocus: string;
  tone: string;
  targetDurationS: number;
  lessonFormat: LessonFormat;
  coreValues: string[];
  themes: string[];
  exclusions: string[];
  seriesSummary: string;
  autopilotCadence: number;
  autopilotConfirm: boolean;
  autoCheck: boolean;
  position: number;
};

export type Character = {
  id: string;
  accountId: string;
  name: string;
  description: string;
  color: string;
  refImagePath: string | null;
  position: number;
};

export type EpisodeIdea = { hint?: string; title?: string; pitch?: string; lesson?: string };

export type Episode = {
  id: string;
  accountId: string;
  number: number;
  title: string;
  idea: EpisodeIdea;
  status: EpisodeStatus;
  lesson: string;
  caption: string;
  hashtags: string[];
  videoPath: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
  views: number | null;
  viewsUpdatedAt: string | null;
  createdAt: string;
};

export type Scene = {
  id: string;
  episodeId: string;
  position: number;
  startS: number;
  durationS: number;
  visual: string;
  dialogue: string;
  characterIds: string[];
  prompt: string;
  clipPath: string | null;
};

export const STYLE_LABELS: Record<AccountStyle, string> = {
  animation_3d: 'Animation 3D',
  anime_2d: 'Anime 2D',
  realiste: 'Réaliste',
};

export function toAccount(r: AccountRow): Account {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    tiktokHandle: r.tiktok_handle,
    style: r.style,
    contentFocus: r.content_focus,
    tone: r.tone,
    targetDurationS: r.target_duration_s,
    lessonFormat: r.lesson_format,
    coreValues: r.core_values,
    themes: r.themes,
    exclusions: r.exclusions,
    seriesSummary: r.series_summary,
    autopilotCadence: r.autopilot_cadence,
    autopilotConfirm: r.autopilot_confirm,
    autoCheck: r.auto_check,
    position: r.position,
  };
}

export function toCharacter(r: CharacterRow): Character {
  return {
    id: r.id,
    accountId: r.account_id,
    name: r.name,
    description: r.description,
    color: r.color,
    refImagePath: r.ref_image_path,
    position: r.position,
  };
}

export function toEpisode(r: EpisodeRow): Episode {
  return {
    id: r.id,
    accountId: r.account_id,
    number: r.number,
    title: r.title,
    idea: (r.idea ?? {}) as EpisodeIdea,
    status: r.status,
    lesson: r.lesson,
    caption: r.caption,
    hashtags: r.hashtags,
    videoPath: r.video_path,
    validatedAt: r.validated_at,
    publishedAt: r.published_at,
    views: r.views,
    viewsUpdatedAt: r.views_updated_at,
    createdAt: r.created_at,
  };
}

export function toScene(r: SceneRow): Scene {
  return {
    id: r.id,
    episodeId: r.episode_id,
    position: r.position,
    startS: Number(r.start_s),
    durationS: Number(r.duration_s),
    visual: r.visual,
    dialogue: r.dialogue,
    characterIds: r.character_ids,
    prompt: r.prompt,
    clipPath: r.clip_path,
  };
}
