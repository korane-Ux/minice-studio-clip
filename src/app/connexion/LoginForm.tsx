'use client';
import { useActionState } from 'react';
import { sendMagicLink, type ActionResult } from './actions';

type State = ActionResult | null;

export function LoginForm() {
  const [state, action, pending] = useActionState<State, FormData>(async (_prev, fd) => sendMagicLink(fd), null);

  if (state?.ok) {
    return (
      <p role="status" className="rounded-ctrl bg-violet-tint p-4 text-sm">
        Lien envoyé. Ouvre ta boîte mail.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-sm font-semibold text-muted">
        Ton adresse email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 text-text"
      />
      {state && !state.ok && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-full bg-violet px-5 font-semibold text-ink disabled:opacity-60"
      >
        {pending ? 'Envoi…' : 'Recevoir mon lien'}
      </button>
    </form>
  );
}
