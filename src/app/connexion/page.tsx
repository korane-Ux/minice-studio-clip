import { LoginForm } from './LoginForm';

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/minice-icon.png" alt="" width={56} height={56} className="mb-4 rounded-ctrl" />
        <h1 className="mb-1 text-2xl font-bold">Minice Studio Clip</h1>
        <p className="mb-6 text-sm text-muted">Connexion sans mot de passe : on t&apos;envoie un lien par email.</p>
        {erreur === 'lien' && (
          <p role="alert" className="mb-4 text-sm text-danger">
            Ce lien n&apos;est plus valable. Demande un nouveau lien.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
