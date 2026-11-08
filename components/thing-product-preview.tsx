"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferGeometry, NormalBufferAttributes } from "three";
import styles from "@/app/make/make.module.css";

export default function ProductPreview({ kind, color, logo }: { kind: "spring" | "buddy" | "tag"; color: string; logo: string | null }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    async function setup() {
      const THREE = await import("three");
      const { OrbitControls } = await import("three/addons/controls/OrbitControls.js");
      if (disposed || !host) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, host.clientWidth / host.clientHeight, .1, 50);
      camera.position.set(4.5, 3.3, 6.4);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      host.appendChild(renderer.domElement);
      renderer.domElement.setAttribute("aria-label", "Interactive 3D product preview. Drag to rotate.");
      renderer.domElement.setAttribute("role", "img");
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.minPolarAngle = .35;
      controls.maxPolarAngle = 1.8;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      controls.autoRotate = !reducedMotion.matches;
      controls.autoRotateSpeed = .65;
      controls.target.set(0, .1, 0);
      controls.addEventListener("start", () => { controls.autoRotate = false; });
      scene.add(new THREE.HemisphereLight(0xfff9ed, 0xa5aab5, 2.4));
      const light = new THREE.DirectionalLight(0xffffff, 3.5);
      light.position.set(-3, 6, 5);
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.normalBias = .035;
      scene.add(light);
      const fill = new THREE.DirectionalLight(0xffd3af, 2);
      fill.position.set(4, 2, -4);
      scene.add(fill);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .13 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -1.65;
      ground.receiveShadow = true;
      scene.add(ground);

      const model = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({ color, roughness: .32, metalness: .05 });
      const addMesh = (geometry: BufferGeometry<NormalBufferAttributes>, meshMaterial = material) => {
        const mesh = new THREE.Mesh(geometry, meshMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        model.add(mesh);
        return mesh;
      };

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d")!;
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      function drawLabel(image?: HTMLImageElement) {
        context.clearRect(0, 0, 512, 512);
        if (image) {
          const scale = Math.min(360 / image.width, 360 / image.height);
          context.drawImage(image, (512 - image.width * scale) / 2, (512 - image.height * scale) / 2, image.width * scale, image.height * scale);
        } else {
          context.fillStyle = "#fff9ed";
          context.font = "500 290px Arial";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("Y", 256, 274);
        }
        texture.needsUpdate = true;
      }
      drawLabel();
      if (logo) {
        const image = new Image();
        image.onload = () => { if (!disposed) drawLabel(image); };
        image.src = logo;
      }
      const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });

      if (kind === "spring") {
        class Helix extends THREE.Curve<InstanceType<typeof THREE.Vector3>> {
          constructor() { super(); }
          getPoint(t: number, point = new THREE.Vector3()) {
            const angle = t * Math.PI * 2 * 20;
            const radius = 1.05 + .07 * Math.sin(t * Math.PI);
            return point.set(Math.cos(angle) * radius, (t - .5) * 2.3, Math.sin(angle) * radius);
          }
        }
        addMesh(new THREE.TubeGeometry(new Helix(), 2000, .048, 8, false));
        const top = addMesh(new THREE.CylinderGeometry(1.12, 1.12, .16, 96));
        top.position.y = 1.22;
        const bottom = addMesh(new THREE.TorusGeometry(1.05, .09, 12, 96));
        bottom.rotation.x = Math.PI / 2;
        bottom.position.y = -1.18;
        const label = new THREE.Mesh(new THREE.CircleGeometry(.92, 64), labelMaterial);
        label.rotation.x = -Math.PI / 2;
        label.position.y = 1.306;
        model.add(label);
        model.rotation.set(.18, -.4, -.28);
      } else if (kind === "buddy") {
        addMesh(new THREE.TorusKnotGeometry(.85, .25, 160, 24, 2, 3));
        model.rotation.set(.4, .2, -.3);
      } else {
        const body = addMesh(new THREE.BoxGeometry(1.8, 1.8, .3, 1, 1, 1));
        body.rotation.z = .1;
        const loop = addMesh(new THREE.TorusGeometry(.27, .085, 16, 48));
        loop.position.y = 1.12;
        const label = new THREE.Mesh(new THREE.PlaneGeometry(1.45, 1.45), labelMaterial);
        label.position.z = .156;
        label.rotation.z = .1;
        model.add(label);
        model.rotation.set(-.15, -.3, -.28);
      }
      scene.add(model);
      const resize = new ResizeObserver(() => {
        if (!host.clientHeight) return;
        camera.aspect = host.clientWidth / host.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(host.clientWidth, host.clientHeight);
      });
      resize.observe(host);
      let visible = true;
      const visibility = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      visibility.observe(host);
      let frame = 0;
      const render = () => {
        frame = requestAnimationFrame(render);
        if (!visible || document.hidden) return;
        controls.update();
        renderer.render(scene, camera);
      };
      render();
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        visibility.disconnect();
        controls.dispose();
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((item) => item.dispose());
          }
        });
        texture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }
    setup().catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; cleanup(); };
  }, [color, kind, logo]);

  return <div ref={hostRef} className={styles.modelHost}>{error ? <div className={styles.modelFallback}><span>Y</span><small>Your {kind === "spring" ? "custom slinky" : "custom creation"}</small></div> : null}</div>;
}
