import { LoginForm } from './LoginForm';
import { LoginWaves } from './LoginWaves';

export default async function ConnexionPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col bg-[#eef1f8] text-ink md:flex-row">
      {/* Illustration : vagues + personnage Minice */}
      <section className="relative h-72 overflow-hidden md:h-auto md:min-h-screen md:w-[58%]">
        <LoginWaves />
        <div className="absolute inset-0 flex items-center justify-center pb-16 md:pb-0 md:pr-[12%]">
          <div className="relative">
            <div className="absolute inset-[8%] rounded-full bg-white/15 blur-2xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/minice-hero.png"
              alt="Le personnage de Minice"
              width={512}
              height={512}
              className="relative w-40 drop-shadow-[0_18px_30px_rgba(12,24,44,0.35)] md:w-[min(32vw,420px)]"
            />
          </div>
        </div>
      </section>

      {/* Carte de connexion */}
      <section className="relative z-10 -mt-12 flex flex-1 items-start justify-center px-5 pb-10 md:mt-0 md:-ml-20 md:items-center md:px-10">
        <div className="w-full max-w-sm rounded-[28px] bg-warning p-8 shadow-[0_24px_60px_-24px_rgba(12,24,44,0.55)]">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/minice-icon.png" alt="" width={36} height={36} className="rounded-[10px]" />
            <span className="font-semibold">Minice Studio Clip</span>
          </div>
          <h1 className="mb-6 mt-7 text-center text-2xl font-semibold">Connecte-toi pour continuer</h1>
          {erreur === 'lien' && (
            <p role="alert" className="mb-4 rounded-ctrl bg-white/60 p-3 text-sm font-medium text-[#7f1d1d]">
              Ce lien n&apos;est plus valable. Demande un nouveau lien.
            </p>
          )}
          <LoginForm />
          <p className="mt-6 text-center text-xs text-ink/75">Par lien email ou avec ton mot de passe.</p>
        </div>
      </section>
    </main>
  );
}
