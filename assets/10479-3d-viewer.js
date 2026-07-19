import * as THREE from "./vendor/three/three.module.min.js";
import { OrbitControls } from "./vendor/three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "./vendor/three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "./vendor/three/libs/meshopt_decoder.module.js";

async function initNexusViewer() {
const host = document.querySelector("[data-nexus-viewer]");

if (host) {
  const canvas = host.querySelector("canvas");
  const poster = host.querySelector(".nexus-viewer-poster");
  const loading = host.querySelector(".nexus-viewer-loading");
  const loadingLabel = host.querySelector(".nexus-viewer-loading-label");
  const progressBar = host.querySelector(".nexus-viewer-progress span");
  const percentLabel = host.querySelector(".nexus-viewer-percent");
  const fallback = host.querySelector(".nexus-viewer-fallback");
  const resetButton = document.querySelector("[data-viewer-reset]");
  const rotateButton = document.querySelector("[data-viewer-rotate]");
  const fullscreenButton = document.querySelector("[data-viewer-fullscreen]");
  const section = host.closest(".nexus-viewer-section");

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch (error) {
    showFailure("此浏览器无法启动 WebGL 3D 视图。", error);
  }

  if (renderer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.001, 10000);
    const controls = new OrbitControls(camera, canvas);
    const modelUrl = host.dataset.model;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let model = null;
    let visible = true;
    let fittedCamera = null;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.35 : 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.84;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x58666b, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.35);
    key.position.set(5, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xbadfe2, 1.35);
    fill.position.set(-6, 3, -5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xfff3d8, 0.9);
    rim.position.set(1, 5, -7);
    scene.add(rim);

    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.zoomToCursor = false;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.9;
    controls.autoRotateSpeed = 0.85;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (model && !host.dataset.interacted) fitModel();
    };
    new ResizeObserver(resize).observe(host);
    resize();

    const markInteraction = () => {
      host.dataset.interacted = "true";
    };
    controls.addEventListener("start", markInteraction);
    canvas.addEventListener("wheel", markInteraction, { passive: true });

    const setProgress = (value, label) => {
      const bounded = Math.max(0, Math.min(value, 100));
      progressBar.style.width = `${bounded}%`;
      percentLabel.textContent = `${Math.round(bounded)}%`;
      if (label) loadingLabel.textContent = label;
    };

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    await MeshoptDecoder.ready;

    const handleModel = (gltf) => {
        model = gltf.scene;
        let meshes = 0;
        let triangles = 0;
        model.traverse((node) => {
          if (!node.isMesh) return;
          meshes += 1;
          const geometry = node.geometry;
          triangles += geometry.index
            ? geometry.index.count / 3
            : geometry.attributes.position.count / 3;
          const materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach((material) => {
            if (!material) return;
            material.envMapIntensity = 0.7;
            if (material.transparent) material.depthWrite = false;
          });
        });
        scene.add(model);
        fitModel();
        setProgress(100, "NEXUS 3D 已就绪");
        host.dataset.ready = "true";
        host.dataset.meshes = String(meshes);
        host.dataset.triangles = String(Math.round(triangles));
        window.setTimeout(() => {
          loading.hidden = true;
          poster.hidden = true;
        }, 320);
      };
    const handleModelError = (error) => showFailure("NEXUS 3D 模型加载失败。", error);

    if (window.NEXUS_GLB_BASE64) {
      setProgress(6, "正在解码 NEXUS 3D");
      await new Promise((resolve) => requestAnimationFrame(resolve));
      try {
        const binary = atob(window.NEXUS_GLB_BASE64);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        window.NEXUS_GLB_BASE64 = null;
        setProgress(58, "正在构建 NEXUS 3D");
        loader.parse(bytes.buffer, "", handleModel, handleModelError);
      } catch (error) {
        handleModelError(error);
      }
    } else if (modelUrl) {
      loader.load(
        modelUrl,
        handleModel,
        (event) => {
          if (!event.total) return;
          setProgress((event.loaded / event.total) * 100);
        },
        handleModelError,
      );
    } else {
      handleModelError(new Error("NEXUS model data is missing."));
    }

    function fitModel() {
      if (!model) return;
      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      if (box.isEmpty()) return;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      const center = sphere.center;
      const radius = Math.max(sphere.radius, 0.001);
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const limitingFov = Math.min(verticalFov, horizontalFov);
      const framingPadding = camera.aspect < 0.85 ? 1.42 : 1.16;
      const distance = (radius / Math.sin(limitingFov / 2)) * framingPadding;
      const direction = new THREE.Vector3(0.86, 0.56, 0.9).normalize();

      controls.target.copy(center);
      camera.position.copy(center).add(direction.multiplyScalar(distance));
      camera.near = Math.max(radius / 1000, 0.0001);
      camera.far = Math.max(radius * 100, 100);
      camera.updateProjectionMatrix();
      controls.minDistance = radius * 0.42;
      controls.maxDistance = radius * 9;
      controls.update();
      fittedCamera = {
        position: camera.position.clone(),
        target: controls.target.clone(),
      };
    }

    const resetView = () => {
      if (!fittedCamera) return;
      camera.position.copy(fittedCamera.position);
      controls.target.copy(fittedCamera.target);
      controls.autoRotate = false;
      controls.update();
      rotateButton?.setAttribute("aria-pressed", "false");
      rotateButton?.setAttribute("aria-label", "开启自动旋转");
      if (rotateButton) rotateButton.title = "自动旋转";
      const icon = rotateButton?.querySelector("span");
      if (icon) icon.textContent = "▶";
      delete host.dataset.interacted;
    };

    resetButton?.addEventListener("click", resetView);
    rotateButton?.addEventListener("click", () => {
      controls.autoRotate = !controls.autoRotate;
      rotateButton.setAttribute("aria-pressed", String(controls.autoRotate));
      rotateButton.setAttribute("aria-label", controls.autoRotate ? "停止自动旋转" : "开启自动旋转");
      rotateButton.title = controls.autoRotate ? "停止旋转" : "自动旋转";
      rotateButton.querySelector("span").textContent = controls.autoRotate ? "❚❚" : "▶";
    });
    fullscreenButton?.addEventListener("click", async () => {
      if (!section) return;
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await section.requestFullscreen();
        }
      } catch {
        fullscreenButton.setAttribute("aria-disabled", "true");
        fullscreenButton.setAttribute("aria-label", "此浏览器不允许全屏查看");
        fullscreenButton.title = "此浏览器不允许全屏";
      }
    });
    const getFullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    const updateFullscreenButton = () => {
      const active = getFullscreenElement() === section;
      fullscreenButton?.setAttribute("aria-pressed", String(active));
      fullscreenButton?.setAttribute("aria-label", active ? "退出全屏" : "全屏查看 3D 模型");
    };
    document.addEventListener("fullscreenchange", updateFullscreenButton);
    document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

    let animationLoopRunning = false;
    const renderFrame = () => {
      if (reducedMotion.matches) controls.autoRotate = false;
      controls.update();
      renderer.render(scene, camera);
    };
    const shouldRender = () => visible || getFullscreenElement() === section;
    const syncAnimationLoop = () => {
      const shouldRun = shouldRender();
      if (shouldRun === animationLoopRunning) return;
      animationLoopRunning = shouldRun;
      renderer.setAnimationLoop(shouldRun ? renderFrame : null);
    };

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimationLoop();
    }, { rootMargin: "160px" }).observe(host);
    document.addEventListener("fullscreenchange", syncAnimationLoop);
    document.addEventListener("webkitfullscreenchange", syncAnimationLoop);
    syncAnimationLoop();

    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      showFailure("3D 视图已暂停，请刷新页面。");
    });

    window.nexusViewer = {
      camera,
      controls,
      renderer,
      scene,
      resetView,
      fitModel,
    };
  }

  function showFailure(message, error) {
    console.error(error || message);
    loading.hidden = true;
    fallback.hidden = false;
    fallback.textContent = message;
    host.dataset.error = "true";
  }
}
}

initNexusViewer().catch((error) => console.error(error));
