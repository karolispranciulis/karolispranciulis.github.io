#!/usr/bin/env python3
"""
generate_project_tree.py
=========================

Turns a real project folder (e.g. your actual IntelliJ Minecraft-plugin
project) into the JSON file the site's code viewer reads, so the website
always shows your real code — no manual copy/paste, no manual HTML pages.

USAGE
-----
    python3 tools/generate_project_tree.py <source_folder> <slug>

Example (matches the sample already set up in this repo):

    python3 tools/generate_project_tree.py project-sources/minecraft-plugin minecraft-plugin

This writes:  _data/project_files/minecraft-plugin.json

Then in the project's markdown front matter (_projects/*.md) set:

    code_data: minecraft-plugin

...and the "Code" section with the file tree + viewer appears automatically
on that project's page. Projects that don't set `code_data` never get a
viewer — this is opt-in per project, so it stays specific to the Minecraft
plugin unless you choose to use it elsewhere.

HOW TO ADD/UPDATE A PROJECT'S CODE IN THE FUTURE
-------------------------------------------------
1. Put (or update) the real project folder under `project-sources/<slug>/`.
2. Run this script (or just push — see the GitHub Action below, which runs
   this automatically on every push so you never have to run it by hand).
3. Commit the generated _data/project_files/<slug>.json file.

WHAT GETS SKIPPED
------------------
Binary files, build output folders (build/, .gradle/, out/, .idea/, node_modules/)
and anything over MAX_FILE_SIZE are skipped automatically so the JSON stays small
and doesn't leak IDE/build junk onto the website.
"""

import sys
import json
from pathlib import Path

MAX_FILE_SIZE = 200_000  # bytes; larger files are skipped, not embedded
SKIP_DIRS = {".git", ".gradle", ".idea", "build", "out", "node_modules", "bin", ".DS_Store"}

LANGUAGE_BY_EXT = {
    ".kt": "kotlin", ".kts": "kotlin",
    ".java": "java",
    ".yml": "yaml", ".yaml": "yaml",
    ".xml": "xml",
    ".json": "json",
    ".md": "markdown",
    ".gradle": "groovy",
    ".properties": "properties",
    ".txt": "plaintext",
}


def is_probably_text(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            chunk = f.read(2048)
        chunk.decode("utf-8")
        return True
    except (UnicodeDecodeError, OSError):
        return False


def build_node(path: Path, root: Path):
    if path.is_dir():
        if path.name in SKIP_DIRS:
            return None
        children = []
        for child in sorted(path.iterdir()):
            node = build_node(child, root)
            if node:
                children.append(node)
        if not children:
            return None
        return {"name": path.name, "type": "dir", "children": children}

    # file
    if path.stat().st_size > MAX_FILE_SIZE or not is_probably_text(path):
        return None

    ext = path.suffix.lower()
    return {
        "name": path.name,
        "type": "file",
        "language": LANGUAGE_BY_EXT.get(ext, ""),
        "path": str(path.relative_to(root)),
        "content": path.read_text(encoding="utf-8", errors="replace"),
    }


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    source_dir = Path(sys.argv[1]).resolve()
    slug = sys.argv[2]

    if not source_dir.exists():
        print(f"Source folder not found: {source_dir}")
        sys.exit(1)

    tree = build_node(source_dir, source_dir)
    if tree is None:
        print("No text files found to include — nothing generated.")
        sys.exit(1)

    tree["name"] = source_dir.name  # root label shown in the viewer

    repo_root = Path(__file__).resolve().parent.parent
    out_dir = repo_root / "_data" / "project_files"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.json"

    out_path.write_text(json.dumps(tree, indent=2), encoding="utf-8")
    print(f"Wrote {out_path.relative_to(repo_root)}")


if __name__ == "__main__":
    main()
