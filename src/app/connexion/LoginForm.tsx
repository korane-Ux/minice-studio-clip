'use client';
import { useActionState, useState } from 'react';
import { sendMagicLink, signInWithPassword, type ActionResult } from './actions';

type State = ActionResult | null;
type Mode = 'lien' | 'motdepasse';

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

const field = 'flex min-h-12 items-center gap-3 rounded-full bg-white px-5 text-ink focus-within:ring-2 focus-within:ring-ink';
const input = 'min-h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink/55 focus:outline-none';

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('lien');
  const [state, action, pending] = useActionState<State, FormData>(
    async (_prev, fd) => (fd.get('mode') === 'motdepasse' ? signInWithPassword(fd) : sendMagicLink(fd)),
    null,
  );

  if (state?.ok && mode === 'lien') {
    return (
      <p role="status" className="rounded-[18px] bg-white/70 p-4 text-center text-sm font-medium">
        Lien envoyé. Ouvre ta boîte mail, dans ce même navigateur.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="mode" value={mode} />
      <label htmlFor="email" className="sr-only">
        Ton adresse email
      </label>
      <div className={field}>
        <MailIcon />
        <input id="email" name="email" type="email" required autoComplete="email" placeholder="Ton adresse email" className={input} />
      </div>
      {mode === 'motdepasse' && (
        <>
          <label htmlFor="password" className="sr-only">
            Mot de passe
          </label>
          <div className={field}>
            <LockIcon />
            <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="Mot de passe" className={input} />
          </div>
        </>
      )}
      {state && !state.ok && (
        <p role="alert" className="rounded-ctrl bg-white/60 p-3 text-sm font-medium text-[#7f1d1d]">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 min-h-12 rounded-full bg-ink px-5 font-semibold text-[#eef1f8] transition hover:bg-[#16284a] disabled:opacity-60"
      >
        {pending ? 'Un instant…' : mode === 'lien' ? 'Recevoir mon lien' : 'Se connecter'}
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === 'lien' ? 'motdepasse' : 'lien')}
        className="min-h-11 text-sm font-semibold underline underline-offset-4"
      >
        {mode === 'lien' ? 'Avec un mot de passe' : 'Avec un lien par email'}
      </button>
    </form>
  );
}
