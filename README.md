# Basoor Family Tree

Public site: https://trrishmanb-netizen.github.io/Basoor-Family-Tree/

This repository serves the public frontend from its root through GitHub Pages. The original tree is preserved as `legacy-tree.html`. The editable React frontend, family data, and API source are in `site-source/`.

## Build the GitHub Pages frontend

The frontend uses the existing Basoor Family Portal backend for accounts, events, gallery, profile edits, and contact requests. GitHub Pages serves static files only.

1. Install Node.js 22.13 or newer.
2. In `site-source/`, run `npm ci` and `npm run build:github`.
3. Copy `site-source/github-dist/index.html` and the `assets/` folder to this repository root.
4. Commit and push to `main`. GitHub Pages will serve the updated files.

The backend is deployed separately from `site-source/` with the existing Sites project configuration. No credentials or admin setup codes are committed here.

The blue and pink card colours are a draft inferred from names. The family administrator can correct them from **My Account → Edit details → Card colour**.
