'use client';
import { useActionState } from 'react';
import type { FormResult } from '@/app/comptes/[id]/actions';
import type { Account } from '@/lib/domain/types';
import { AutopilotCard } from './AutopilotCard';
import { ChipsField } from './ChipsField';

const field = 'min-h-11 rounded-ctrl border border-line bg-surface-2 px-3 font-normal text-text';
const label = 'flex flex-col gap-1.5 text-sm font-semibold text-muted';

export function AccountForm({
  account,
  hasApiKeys,
  action,
}: {
  account: Account;
  hasApiKeys: boolean;
  action: (fd: FormData) => Promise<FormResult>;
}) {
  const [state, submit, pending] = useActionState<FormResult | null, FormData>((_p, fd) => action(fd), null);

  return (
    <form action={submit} className="flex flex-col gap-5">
      <section aria-labelledby="univers-titre" className="flex flex-col gap-4 rounded-card border border-line bg-surface p-6">
        <h2 id="univers-titre" className="text-lg font-semibold">
          Univers et style
        </h2>
        <div className="flex flex-wrap gap-4">
          <label className={`${label} flex-[1_1_180px]`}>
            Nom du compte
            <input name="name" defaultValue={account.name} maxLength={40} required className={field} />
          </label>
          <label className={`${label} flex-[1_1_160px]`}>
            Style visuel
            <select name="style" defaultValue={account.style} className={field}>
              <option value="animation_3d">Animation 3D</option>
              <option value="anime_2d">Anime 2D</option>
              <option value="realiste">Réaliste</option>
            </select>
          </label>
          <label className={`${label} flex-[1_1_140px]`}>
            Durée cible
            <select name="targetDurationS" defaultValue={account.targetDurationS} className={field}>
              <option value={20}>20 secondes</option>
              <option value={30}>30 secondes</option>
              <option value={40}>40 secondes</option>
            </select>
          </label>
          <label className={`${label} w-28`}>
            Couleur
            <input type="color" name="color" defaultValue={account.color} className="h-11 w-full rounded-ctrl border border-line bg-surface-2" />
          </label>
        </div>
        <label className={label}>
          Contenu
          <input name="contentFocus" defaultValue={account.contentFocus} maxLength={200} className={field} />
        </label>
        <label className={label}>
          Ton
          <input name="tone" defaultValue={account.tone} maxLength={200} className={field} />
        </label>
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <section aria-labelledby="valeurs-titre" className="flex min-w-0 flex-[3_1_420px] flex-col gap-5 rounded-card border border-line bg-surface p-6">
          <h2 id="valeurs-titre" className="text-lg font-semibold">
            Valeurs, thèmes et règles
          </h2>
          <ChipsField name="coreValues" label="Valeurs mises en avant" values={account.coreValues} max={12} tone="accent" />
          <ChipsField name="themes" label="Thèmes des histoires" values={account.themes} max={12} tone="neutral" inputLabel="Nouveau thème" />
          <ChipsField name="exclusions" label="Toujours exclu" values={account.exclusions} max={12} tone="danger" inputLabel="Nouvelle exclusion" />
          <label className={label}>
            Leçon finale
            <select name="lessonFormat" defaultValue={account.lessonFormat} className={field}>
              <option value="verset">Un verset biblique (Louis Segond 1910) avec sa référence</option>
              <option value="phrase_personnage">Une phrase dite par un personnage</option>
              <option value="phrase_ecran">Une phrase affichée à l&apos;écran</option>
            </select>
          </label>
        </section>
        <div className="min-w-0 flex-[2_1_300px]">
          <AutopilotCard account={account} hasApiKeys={hasApiKeys} />
        </div>
      </div>

      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {state && (
          <p role={state.ok ? 'status' : 'alert'} className={`text-sm ${state.ok ? 'text-success' : 'text-danger'}`}>
            {state.ok ? state.message : state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-violet px-6 font-semibold text-ink shadow-lg disabled:opacity-60">
          {pending ? 'Enregistrement…' : 'Enregistrer la bible'}
        </button>
      </div>
    </form>
  );
}
