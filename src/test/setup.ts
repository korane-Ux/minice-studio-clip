import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

afterEach(() => cleanup());

// 'server-only' interdit l'import hors serveur Next ; neutre dans les tests.
vi.mock('server-only', () => ({}));
