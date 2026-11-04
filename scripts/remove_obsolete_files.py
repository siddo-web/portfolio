#!/usr/bin/env python3
"""Remove only the exact old files listed in OBSOLETE_FILES_TO_REMOVE.txt.

Use after copying the updated ZIP into an existing checkout, and after making
sure you have no unsaved changes to these specific obsolete files.
Never touches .git or local .env files.
"""
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
list_file=ROOT/'OBSOLETE_FILES_TO_REMOVE.txt'
if not list_file.exists():raise SystemExit('Cleanup list not found')
deleted=[]
for row in list_file.read_text(encoding='utf8').splitlines():
 row=row.strip()
 if not row or row.startswith('#'):continue
 candidate=(ROOT/row).resolve()
 if ROOT.resolve() not in candidate.parents or '.git' in candidate.parts or candidate.name.startswith('.env'):
  print('Skipping unsafe target:',row);continue
 if candidate.is_file():candidate.unlink();deleted.append(row)
print('Deleted',len(deleted),'obsolete files. Review: git status')
