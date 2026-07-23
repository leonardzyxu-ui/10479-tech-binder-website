# How We Put the Robot GLB on the Website

The robot is stored as a normal `.glb` asset at:

`binder_assets/10479/3d/nexus-web.glb`

The webpage contains a `<canvas>` and points to that file using a `data-model` attribute. Our JavaScript viewer then:

1. Creates a 3D scene, camera, lights, and WebGL renderer with **Three.js**.
2. Loads the GLB with Three.js `GLTFLoader`.
3. Uses `MeshoptDecoder` to decode the model's compressed mesh data.
4. Adds the loaded robot to the scene and automatically centers and frames it.
5. Uses `OrbitControls` so dragging rotates the camera around the robot and pinching changes the viewing distance.
6. Continuously redraws the scene on the canvas with WebGL.

The main viewer source is `assets/10479-3d-viewer.js`. The browser receives its bundled version, `assets/10479-3d-viewer.bundle.js`, so Three.js and its required modules work without external libraries.

## Hosted Website vs. Offline Folder

- **Hosted website:** JavaScript loads `nexus-web.glb` directly as a normal asset. The GLB is not embedded in the HTML.
- **Offline `file://` folder:** Chrome normally blocks JavaScript from fetching a nearby binary GLB. For this case, we generated `nexus-web-data.js`, which stores the same GLB bytes as Base64. The viewer decodes that Base64 back into binary memory and passes it to `GLTFLoader.parse()`.

In short: **Three.js + GLTFLoader renders the robot; OrbitControls provides interaction; the hosted site loads the GLB file directly, while the offline folder uses a Base64 JavaScript fallback to bypass local-file restrictions.**
