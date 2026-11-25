'use client';
import { useActionState } from 'react';
import { sendMagicLink, type ActionResult } from './actions';

type State = ActionResult | null;

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(async (_prev, fd) => sendMagicLink(fd), null);

  if (state?.ok) {
    return (
      <p role="status" className="rounded-[18px] bg-white/70 p-4 text-center text-sm font-medium">
        Lien envoyé. Ouvre ta boîte mail, dans ce même navigateur.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="email" className="sr-only">
        Ton adresse email
      </label>
      <div className="flex min-h-12 items-center gap-3 rounded-full bg-white px-5 text-ink focus-within:ring-2 focus-within:ring-ink">
        <MailIcon />
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Ton adresse email"
          className="min-h-12 w-full bg-transparent text-sm text-ink placeholder:text-ink/55 focus:outline-none"
        />
      </div>
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
        {pending ? 'Envoi…' : 'Recevoir mon lien'}
      </button>
    </form>
  );
}
