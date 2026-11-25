import { AppShell } from '@/components/shell/AppShell';

export default function ClesApiPage() {
  return (
    <AppShell active="cles">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 md:p-10">
        <h1 className="text-3xl font-bold">Clés API</h1>
        <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-6">
          <span className="self-start rounded-full bg-warning px-3 py-1 text-xs font-bold text-ink">Bientôt</span>
          <p>Le pilote automatique arrive avec la prochaine version. Il te faudra une clé API Anthropic et une clé pour le modèle vidéo.</p>
          <p className="text-muted">En attendant, tout fonctionne gratuitement en mode Pas à pas : tu copies les textes dans Claude et tu génères les clips dans un outil vidéo gratuit.</p>
          <p className="text-sm text-muted">Tes clés seront chiffrées côté serveur et ne seront jamais affichées en clair après leur enregistrement.</p>
        </section>
      </main>
    </AppShell>
  );
}
