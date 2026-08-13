# What's in this package and where it goes

Your repo (`karolispranciulis.github.io`) already has the right Jekyll
structure (`_data`, `_layouts`, `_projects`, `_skills`, `assets`,
`_config.yml`, `index.html`) and `index.html` already matches what you
described — single `xao3` home button, nav order Skills → Projects → About →
Contact, Contact section with GitHub + Gmail. So none of that needed
touching.

This package replaces/adds the pieces that actually needed work: theme,
scroll behaviour, the project carousel, and the code viewer.

## 1. Copy these files into your repo (overwrite where they already exist)

```
assets/css/style.css                         → replace
assets/js/main.js                            → replace
assets/js/code-viewer.js                     → new
_layouts/project.html                        → new/replace
_projects/minecraft-plugin-development-kotlin.md → new/replace
_data/skills.yml                             → new/replace
_data/project_files/minecraft-plugin.json    → new (auto-generated, see below)
tools/generate_project_tree.py               → new
.github/workflows/build-project-files.yml    → new
project-sources/minecraft-plugin/...         → new (sample — replace with your real project)
```

You'll need two images that don't exist yet (any small png works, ~64–128px):

```
assets/img/skills/kotlin.png
assets/img/projects/minecraft-plugin.png
```

## 2. What was fixed

- **Theme** — pure black / blue / white (`#05070a` background, `#3fa9ff`
  accent, white text). No yellow anywhere, including default focus outlines.
- **The `{}` you were seeing** — that's Liquid template syntax (curly-brace
  tags) not being processed, which happens if you open `index.html` as a local file instead
  of viewing the *built* site. It won't happen on the live GitHub Pages URL
  as long as the Pages build succeeds (check the **Actions** tab on GitHub —
  if a build fails, Pages serves the old build, so also double check that).
- **Full-section scrolling, no bleed-through** — `main#site-root` uses
  `scroll-snap-type: y mandatory` and every `.panel` is exactly `100vh`.
  One scroll always lands you fully on the next section; you can't rest
  halfway, and you never see two sections at once. This is native CSS, not
  a JS animation library — so it stays fast and simple, per your "no move
  animations" request.
- **Project carousel** — shows 2 projects per view. With ≤2 projects, it's
  a plain static grid (no scroll controls at all). Once you add a 3rd
  project, prev/next arrows appear automatically and it loops.
- **Code viewer** — an IntelliJ-style file tree + code pane, but it's
  **opt-in per project** via a `code_data:` field in that project's front
  matter. Only the Minecraft plugin project has it right now; future
  projects won't get one unless you add `code_data:` to them too.

## 3. Setting up the code viewer with your real plugin project

Replace the sample under `project-sources/minecraft-plugin/` with your
actual IntelliJ project folder (the real `build.gradle.kts`, `src/`, etc.),
keeping the same top-level folder name `minecraft-plugin`.

Then either:

- **Automatically**: push. The GitHub Action
  (`.github/workflows/build-project-files.yml`) runs
  `tools/generate_project_tree.py` on every push that touches
  `project-sources/**`, regenerates
  `_data/project_files/minecraft-plugin.json`, and commits it — so the site
  always reflects whatever is in `project-sources/minecraft-plugin/`.
- **Manually** (e.g. to test locally first):
  ```
  python3 tools/generate_project_tree.py project-sources/minecraft-plugin minecraft-plugin
  ```

Build/IDE junk (`.git`, `.gradle`, `.idea`, `build`, `out`, `node_modules`)
is skipped automatically, and files over ~200KB or binary files are skipped
too, so the JSON stays small.

## 4. Adding a skill in the future

Drop an image in `assets/img/skills/`, add one entry to `_data/skills.yml`:

```yaml
- name: Java
  image: /assets/img/skills/java.png
  description: >
    Short description of this skill.
```

No HTML/CSS changes needed — `index.html` already loops over this file.

## 5. Adding a project in the future

Create `_projects/<slug>.md`:

```yaml
---
layout: project
title: My New Project
short_description: One line for the card on the Projects section.
icon: /assets/img/projects/my-new-project.png
# code_data: my-new-project   ← only add this if you want a code viewer for it
---
Longer description goes here.
```

If you skip `code_data`, the project page just shows the description — no
code viewer, no `project-sources/` folder needed. This keeps the IDE-style
viewer specific to the Minecraft plugin unless you deliberately opt another
project into it.
