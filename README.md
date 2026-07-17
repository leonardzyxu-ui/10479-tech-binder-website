# Team 10479 NEXUS Tech Binder

Static GitHub Pages-ready Chinese technical binder for Team 10479's 2026 robot, NEXUS. The visual system and interaction pattern follow the HighTide 2026 binder reference; all visible robot content and media are local Team 10479 assets.

## publish on github pages

1. Create a GitHub repository and push this folder.
2. In the GitHub repository, open `settings` -> `pages`.
3. Set source to `deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. Save. The site should load from the Pages URL once GitHub finishes deploying.

No build step is required. The deployable entry point is `index.html` at the repository root.

## local preview

Open `index.html` directly in a browser. The complete site, including the interactive 3D viewer, works from `file://` without a local server or internet connection.

## files

- `index.html` is the interactive website.
- `assets/`, `binder_assets/`, and `fonts/` are local static assets required by the site.
- `scripts/prepare_robot_assets.py` deterministically rebuilds the optimized robot imagery from Leo's supplied source files.
- `binder_assets/10479/3d/nexus-web.glb` is the 23 MB browser LOD generated from the untouched 748.5 MB SolidWorks GLB.
- `binder_assets/10479/3d/nexus-web-data.js` mirrors that LOD for direct offline opening; hosted copies continue loading the smaller `.glb` asset normally.
- `hosted-assets/nexus-web.glb` is a separate 424,162-triangle Sites LOD; it keeps the same camera controls while fitting the public deployment package.

The site makes no runtime requests. Three.js, its loaders, every image, and the GLB are stored in the repository, so the complete experience works without internet when opened directly or published on GitHub Pages.
