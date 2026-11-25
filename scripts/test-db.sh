#!/usr/bin/env bash
# Lance les tests pgTAP de supabase/tests sur un PostgreSQL local (sans Docker).
# Avec Docker et la CLI Supabase, `supabase test db` lance les mêmes fichiers.
set -euo pipefail
shopt -s nullglob
cd "$(dirname "$0")/.."
DB=msc_test
PSQL=(psql -X -v ON_ERROR_STOP=1 -q)
run() { su postgres -c "$*"; }

run "dropdb --if-exists $DB" >/dev/null
run "createdb $DB"
run "psql -X -v ON_ERROR_STOP=1 -q -d $DB -f '$PWD/supabase/tests/_local/supabase_stub.sql'" >/dev/null
for f in supabase/migrations/*.sql; do
  run "psql -X -v ON_ERROR_STOP=1 -q -d $DB -f '$PWD/$f'" >/dev/null
done

fail=0
for t in supabase/tests/*.test.sql; do
  out=$(run "psql -X -q -t -A -d $DB -f '$PWD/$t'" 2>&1 || true)
  if echo "$out" | grep -qE '^not ok|ERROR|Looks like'; then
    echo "FAIL $t"; echo "$out" | grep -E '^not ok|ERROR|#|Looks like' | head -20; fail=1
  else
    echo "ok   $t ($(echo "$out" | grep -c '^ok') tests)"
  fi
done
exit $fail
