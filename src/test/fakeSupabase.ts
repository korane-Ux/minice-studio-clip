// Faux client Supabase pour les tests des actions : enregistre chaque requête
// et répond avec ce que le test fournit.
export type FakeOp = {
  table: string;
  action: 'select' | 'update' | 'delete';
  values?: Record<string, unknown>;
  filters: [string, unknown][];
};

type Answer = { data?: unknown; error?: unknown };

export function fakeSupabase(answer: (op: FakeOp) => Answer = () => ({})) {
  const ops: FakeOp[] = [];
  const removed: Record<string, string[]> = {};

  function from(table: string) {
    const op: FakeOp = { table, action: 'select', filters: [] };
    const run = () => {
      ops.push(op);
      return Promise.resolve({ data: null, error: null, ...answer(op) });
    };
    const builder = {
      select: () => builder,
      update: (values: Record<string, unknown>) => {
        op.action = 'update';
        op.values = values;
        return builder;
      },
      delete: () => {
        op.action = 'delete';
        return builder;
      },
      eq: (column: string, value: unknown) => {
        op.filters.push([column, value]);
        return builder;
      },
      in: (column: string, value: unknown) => {
        op.filters.push([column, value]);
        return builder;
      },
      order: () => builder,
      maybeSingle: run,
      single: run,
      then: (ok: (v: unknown) => unknown, ko?: (e: unknown) => unknown) => run().then(ok, ko),
    };
    return builder;
  }

  const storage = {
    from: (bucket: string) => ({
      remove: async (paths: string[]) => {
        (removed[bucket] ??= []).push(...paths);
        return { data: [], error: null };
      },
    }),
  };

  return { client: { from, storage, rpc: async () => ({ data: null, error: null }) }, ops, removed };
}
