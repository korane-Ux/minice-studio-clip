import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PublishPanel } from '@/components/publish/PublishPanel';
import { toEpisode } from '@/lib/domain/types';
import { requireUser } from '@/lib/supabase/server';
import { markPublished, saveViews } from '../actions';

export default async function PublishEpisodePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const { data: row } = await supabase.from('episodes').select('*').eq('id', id).maybeSingle();
  if (!row) notFound();
  const episode = toEpisode(row);
  if (episode.status !== 'valide' && episode.status !== 'publie') notFound();
  const { data: account } = await supabase.from('accounts').select('name').eq('id', episode.accountId).single();

  let videoUrl: string | null = null;
  if (episode.videoPath) {
    const { data } = await supabase.storage.from('videos').createSignedUrl(episode.videoPath, 3600, { download: `${episode.title || 'episode'}.mp4` });
    videoUrl = data?.signedUrl ?? null;
  }

  return (
    <main className="min-h-screen bg-canvas px-4 pb-10 pt-4">
      <Link href="/publier" className="mb-3 inline-flex min-h-11 items-center text-sm font-semibold text-violet no-underline">
        ‹ Épisodes à publier
      </Link>
      <PublishPanel
        episode={episode}
        accountName={account?.name ?? ''}
        videoUrl={videoUrl}
        onPublish={markPublished.bind(null, episode.id)}
        onViews={saveViews.bind(null, episode.id)}
      />
    </main>
  );
}
