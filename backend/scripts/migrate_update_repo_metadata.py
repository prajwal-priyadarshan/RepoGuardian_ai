#!/usr/bin/env python3
"""
Populate missing `name` and `repo_url` fields in the `repositories` table
by scanning `data/repos` on disk and reading git remotes when available.

Usage:
  python migrate_update_repo_metadata.py [--dry-run]

Requirements:
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_*`) set in environment
  - `gitpython` installed
"""
import argparse
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(override=True)

REPO_ROOT = Path(__file__).resolve().parents[2] / "data" / "repos"


def extract_repo_name_from_url(url: str) -> str:
    try:
        cleaned = url.rstrip("/")
        if cleaned.endswith('.git'):
            cleaned = cleaned[:-4]
        return Path(cleaned).name or "Unnamed Repository"
    except Exception:
        return "Unnamed Repository"


def main(mode: str = "disk", dry_run: bool = True):
    """Modes:
    - disk: scan REPO_ROOT and update DB rows that match repo folder ids
    - db: scan DB records and use existing `repo_url` or disk remotes to populate name/repo_url
    """
    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Supabase credentials are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY.")
        return

    try:
        from supabase import create_client
    except Exception as e:
        print("supabase-py is not installed. Install with: pip install supabase-client")
        return

    try:
        from git import Repo as GitPythonRepo
    except Exception:
        GitPythonRepo = None

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    updated = 0
    skipped = 0

    if mode == 'disk':
        if not REPO_ROOT.exists():
            print(f"Repo root {REPO_ROOT} does not exist. Nothing to do.")
            return

        for repo_path in REPO_ROOT.iterdir():
            if not repo_path.is_dir():
                continue
            repo_id = repo_path.name
            display_name = repo_id
            repo_url = None

            # Try to read git remote URL
            if GitPythonRepo:
                try:
                    gp = GitPythonRepo(repo_path)
                    if hasattr(gp, 'remotes') and gp.remotes:
                        if 'origin' in gp.remotes:
                            origin_url = gp.remotes.origin.url
                        else:
                            origin_url = next(iter(gp.remotes)).url
                        if origin_url:
                            repo_url = origin_url
                            display_name = extract_repo_name_from_url(origin_url)
                except Exception:
                    pass

            # Query DB for existing repo record
            try:
                resp = supabase.table('repositories').select('id,name,repo_url').eq('id', repo_id).execute()
                records = resp.data or []
            except Exception as e:
                print(f"Failed to query Supabase for {repo_id}: {e}")
                continue

            if not records:
                print(f"No DB record for {repo_id}; skipping (no insert by this migration).")
                skipped += 1
                continue

            row = records[0]
            updates = {}
            current_name = row.get('name')
            current_url = row.get('repo_url')

            if (not current_name or str(current_name).strip() == '' or current_name == repo_id) and display_name:
                updates['name'] = display_name

            if (not current_url or str(current_url).strip() == '') and repo_url:
                updates['repo_url'] = repo_url

            if not updates:
                print(f"{repo_id}: nothing to update")
                skipped += 1
                continue

            print(f"{repo_id}: will update {updates}")
            if not dry_run:
                try:
                    supabase.table('repositories').update(updates).eq('id', repo_id).execute()
                    updated += 1
                except Exception as e:
                    print(f"Failed to update {repo_id}: {e}")
            else:
                updated += 1

    elif mode == 'db':
        # Scan DB records
        try:
            resp = supabase.table('repositories').select('id,name,repo_url').execute()
            records = resp.data or []
        except Exception as e:
            print(f"Failed to list repositories from Supabase: {e}")
            return

        if not records:
            print("No repositories found in DB.")
            return

        for row in records:
            repo_id = row.get('id')
            current_name = row.get('name')
            current_url = row.get('repo_url')
            display_name = current_name if current_name and current_name.strip() and current_name != repo_id else None
            repo_url = current_url

            # If we don't have a usable name, try to derive from repo_url
            if not display_name and current_url:
                display_name = extract_repo_name_from_url(current_url)

            # If still missing and disk is available, try disk remotes
            if not display_name and REPO_ROOT.exists() and GitPythonRepo:
                repo_path = REPO_ROOT / repo_id
                if repo_path.exists() and repo_path.is_dir():
                    try:
                        gp = GitPythonRepo(repo_path)
                        if hasattr(gp, 'remotes') and gp.remotes:
                            if 'origin' in gp.remotes:
                                origin_url = gp.remotes.origin.url
                            else:
                                origin_url = next(iter(gp.remotes)).url
                            if origin_url:
                                repo_url = repo_url or origin_url
                                display_name = extract_repo_name_from_url(origin_url)
                    except Exception:
                        pass

            updates = {}
            if (not current_name or str(current_name).strip() == '' or current_name == repo_id) and display_name:
                updates['name'] = display_name

            if (not current_url or str(current_url).strip() == '') and repo_url:
                updates['repo_url'] = repo_url

            if not updates:
                print(f"{repo_id}: nothing to update")
                skipped += 1
                continue

            print(f"{repo_id}: will update {updates}")
            if not dry_run:
                try:
                    supabase.table('repositories').update(updates).eq('id', repo_id).execute()
                    updated += 1
                except Exception as e:
                    print(f"Failed to update {repo_id}: {e}")
            else:
                updated += 1

    else:
        print(f"Unknown mode: {mode}")
        return

    print(f"Done. {updated} repo(s) would be updated (dry_run={dry_run}). {skipped} skipped.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Do not perform updates; just print actions')
    parser.add_argument('--mode', choices=['disk', 'db'], default='disk', help='Migration mode: disk or db')
    args = parser.parse_args()
    main(mode=args.mode, dry_run=args.dry_run)
