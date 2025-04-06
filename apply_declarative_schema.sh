#!/bin/bash

# Take first argument as migration file name
MIGRATION_FILE=$1
if [ -z "$MIGRATION_FILE" ]; then
  echo "Usage: $0 <migration_file>"
  exit 1
fi

npx supabase stop
npx supabase db diff -f $MIGRATION_FILE
npx supabase start -x vector
npx supabase migration up
