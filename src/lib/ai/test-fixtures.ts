import type { Account, Character } from '@/lib/domain/types';
import type { BibleContext, Idea } from './schemas';

export const parabolesAccount: Account = {
  id: 'acc-par',
  name: 'Paraboles',
  color: '#FBBF24',
  tiktokHandle: null,
  style: 'anime_2d',
  contentFocus: 'Paraboles et récits bibliques mis en scène',
  tone: "Émouvant, respectueux, toujours une note d'espoir",
  targetDurationS: 30,
  lessonFormat: 'verset',
  coreValues: ['Pardon', 'Humilité', 'Foi'],
  themes: ['Paraboles de Jésus'],
  exclusions: ['Adultère', 'Gore'],
  seriesSummary: 'Le fils cadet a quitté la maison avec sa part d’héritage.',
  autopilotCadence: 3,
  autopilotConfirm: true,
  autoCheck: true,
  position: 2,
};

export const merAccount: Account = {
  ...parabolesAccount,
  id: 'acc-mer',
  name: 'Fables de la Mer',
  color: '#2DD4BF',
  style: 'animation_3d',
  contentFocus: 'Fables modernes : leçons de vie et valeurs',
  lessonFormat: 'phrase_personnage',
  themes: ['Fables modernes'],
  seriesSummary: '',
  position: 1,
};

export const pere: Character = { id: 'ch-pere', accountId: 'acc-par', name: 'Le père', description: 'Âgé, barbe blanche, tunique beige. Patient et aimant.', color: '#D9B98B', refImagePath: null, position: 1 };
export const cadet: Character = { id: 'ch-cadet', accountId: 'acc-par', name: 'Le fils cadet', description: 'Jeune, tunique bleue. Impulsif, puis repentant.', color: '#60A5FA', refImagePath: null, position: 2 };

export const gaspard: Character = { id: 'ch-gaspard', accountId: 'acc-mer', name: 'Gaspard', description: 'crabe rouge', color: '#E5484D', refImagePath: null, position: 1 };
export const bernard: Character = { id: 'ch-bernard', accountId: 'acc-mer', name: 'Bernard', description: 'petit bernard-l’ermite gris', color: '#9AA1B8', refImagePath: null, position: 2 };
export const perle: Character = { id: 'ch-perle', accountId: 'acc-mer', name: 'Perle', description: 'huître sage', color: '#F4F5FB', refImagePath: null, position: 3 };

export const paraboles: BibleContext = { account: parabolesAccount, characters: [pere, cadet], summary: parabolesAccount.seriesSummary };
export const ctxMer: BibleContext = { account: merAccount, characters: [gaspard, bernard, perle], summary: '' };

export const idea: Idea = { title: 'Le retour', pitch: 'Le fils cadet revient, ruiné. Son père court vers lui.', lesson: 'Il y a de la joie pour celui qui revient.' };
