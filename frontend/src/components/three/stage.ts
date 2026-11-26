import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

export interface StagePointer {
  x: number;
  y: number;
}

type FrameFn = (elapsed: number, pointer: StagePointer) => void;

/**
 * Boilerplate shared by the ambient three.js scenes: sizing, a damped pointer,
 * a paused loop when off-screen or hidden, and a single static frame for
 * visitors who ask for reduced motion. Returns a teardown function.
 */
export function createStage(mount: HTMLElement, setup: (scene: Scene) => FrameFn, cameraZ = 7.4): () => void {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearAlpha(0);
  mount.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.set(0, 0, cameraZ);

  const frame = setup(scene);

  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };

  const resize = () => {
    const { clientWidth, clientHeight } = mount;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };

  const draw = (elapsed: number) => {
    eased.x += (pointer.x - eased.x) * 0.045;
    eased.y += (pointer.y - eased.y) * 0.045;
    camera.position.x = eased.x * 0.35;
    camera.position.y = -eased.y * 0.25;
    camera.lookAt(0, 0, 0);
    frame(elapsed, eased);
    renderer.render(scene, camera);
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resize();
  draw(0);

  let handle = 0;
  let visible = true;
  const start = performance.now();

  const loop = (now: number) => {
    draw((now - start) / 1000);
    handle = requestAnimationFrame(loop);
  };

  const setRunning = (run: boolean) => {
    if (reduceMotion) return;
    if (run && !handle && visible && !document.hidden) handle = requestAnimationFrame(loop);
    else if (!run && handle) {
      cancelAnimationFrame(handle);
      handle = 0;
    }
  };

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    setRunning(visible);
  });
  observer.observe(mount);

  const onVisibility = () => setRunning(!document.hidden);

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  setRunning(true);

  return () => {
    observer.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    if (handle) cancelAnimationFrame(handle);
    scene.traverse((object) => {
      const withGeometry = object as unknown as { geometry?: { dispose: () => void }; material?: { dispose: () => void } };
      withGeometry.geometry?.dispose();
      withGeometry.material?.dispose();
    });
    renderer.dispose();
    renderer.domElement.remove();
  };
}
