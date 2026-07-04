# team 10479 tech binder website

Static GitHub Pages-ready version of the team 10479 tech binder website.

## publish on github pages

1. Create a GitHub repository and push this folder.
2. In the GitHub repository, open `settings` -> `pages`.
3. Set source to `deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save. The site should load from the Pages URL once GitHub finishes deploying.

No build step is required. The deployable entry point is `index.html` at the repository root.

## local preview

Open `index.html` directly in a browser, or run:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/`.

## files

- `index.html` is the interactive website.
- `print.html` is the print-style view.
- `assets/`, `binder_assets/`, and `fonts/` are local static assets required by the site.
- `mentor-needed-assets.md` is the current mechanical asset request list.

