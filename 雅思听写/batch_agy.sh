#!/usr/bin/env bash
# Batch: agy repair + apply for a list of lessons
set -u
cd /Users/a0/Desktop/雅思听写
export PYTHONPATH=
for L in "$@"; do
  echo "=== $L $(date +%H:%M:%S) ==="
  PYTHONPATH= python3 run_agy.py "$L" > "agy_out/${L}_run.log" 2>&1
  tail -2 "agy_out/${L}_run.log"
  if [ -f "agy_out/${L}_fix.json" ]; then
    PYTHONPATH= python3 apply_agy.py "$L"
  else
    echo "$L: NO FIX JSON (see agy_out/${L}_run.log)"
  fi
done
echo "=== batch done $(date +%H:%M:%S) ==="
