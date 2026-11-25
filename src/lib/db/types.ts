// Types de la base, au format de `supabase gen types typescript`.
// Écrits à la main à partir de supabase/migrations (pas de Docker pour la génération ici).
// Régénérer avec `supabase gen types typescript --linked > src/lib/db/types.ts` quand le projet est lié.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type AccountStyle = 'animation_3d' | 'anime_2d' | 'realiste';
export type LessonFormat = 'verset' | 'phrase_personnage' | 'phrase_ecran';
export type EpisodeStatusDb = 'idee' | 'scenes' | 'montage' | 'a_valider' | 'valide' | 'publie' | 'rejete';

export type AccountRow = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  tiktok_handle: string | null;
  style: AccountStyle;
  content_focus: string;
  tone: string;
  target_duration_s: number;
  lesson_format: LessonFormat;
  core_values: string[];
  themes: string[];
  exclusions: string[];
  series_summary: string;
  autopilot_cadence: number;
  autopilot_confirm: boolean;
  auto_check: boolean;
  position: number;
  created_at: string;
};

export type CharacterRow = {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  description: string;
  color: string;
  ref_image_path: string | null;
  position: number;
  created_at: string;
};

export type EpisodeRow = {
  id: string;
  user_id: string;
  account_id: string;
  number: number;
  title: string;
  idea: Json;
  status: EpisodeStatusDb;
  lesson: string;
  caption: string;
  hashtags: string[];
  video_path: string | null;
  validated_at: string | null;
  published_at: string | null;
  views: number | null;
  views_updated_at: string | null;
  created_at: string;
};

export type SceneRow = {
  id: string;
  user_id: string;
  episode_id: string;
  position: number;
  start_s: number;
  duration_s: number;
  visual: string;
  dialogue: string;
  character_ids: string[];
  prompt: string;
  clip_path: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      accounts: Table<AccountRow, 'name' | 'color' | 'style'>;
      characters: Table<CharacterRow, 'account_id' | 'name'>;
      episodes: Table<EpisodeRow, 'account_id' | 'number'>;
      scenes: Table<SceneRow, 'episode_id' | 'position' | 'start_s' | 'duration_s' | 'visual'>;
    };
    Views: Record<string, never>;
    Functions: {
      seed_default_accounts: { Args: Record<string, never>; Returns: number };
      import_script: { Args: { p_episode_id: string; p_payload: Json }; Returns: undefined };
      import_batch: { Args: { p_account_id: string; p_payload: Json }; Returns: number };
    };
    Enums: {
      account_style: AccountStyle;
      lesson_format: LessonFormat;
      episode_status: EpisodeStatusDb;
    };
    CompositeTypes: Record<string, never>;
  };
};
