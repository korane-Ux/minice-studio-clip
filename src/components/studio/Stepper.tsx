import type { EpisodeStatus } from '@/lib/domain/status';

export const STEPS = ['Idée', 'Script', 'Scènes', 'Montage', 'Validation'] as const;

export function currentStep(status: EpisodeStatus, hasIdea: boolean): number {
  switch (status) {
    case 'idee':
      return hasIdea ? 1 : 0;
    case 'scenes':
      return 2;
    case 'montage':
      return 3;
    case 'a_valider':
      return 4;
    default:
      return STEPS.length;
  }
}

export function Stepper({ current }: { current: number }) {
  return (
    <ol aria-label="Étapes" className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1 text-sm font-semibold">
      {STEPS.map((label, i) => (
        <li
          key={label}
          aria-current={i === current ? 'step' : undefined}
          className={`rounded-full px-3.5 py-2 ${i === current ? 'bg-violet text-ink' : i < current ? 'text-[#2DD4BF]' : 'text-muted'}`}
        >
          {i < current ? `✓ ${label}` : label}
        </li>
      ))}
    </ol>
  );
}
