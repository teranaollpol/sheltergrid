"use client";

import { useEffect, useRef } from "react";

export function ReadinessField() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let frame = 0;
    let resizeObserver: ResizeObserver | undefined;
    let cleanup = () => {};

    void import("three").then((THREE) => {
      if (disposed || !hostRef.current) return;
      const container = hostRef.current;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(4.8, 4.2, 6.5);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      scene.add(new THREE.AmbientLight(0xffffff, 2.1));
      const light = new THREE.DirectionalLight(0xffffff, 2.8);
      light.position.set(4, 7, 5);
      scene.add(light);

      const grid = new THREE.Group();
      const palette = [0x90b800, 0xe1e100, 0xffffff, 0xff6b6b];
      for (let row = 0; row < 3; row += 1) {
        for (let column = 0; column < 7; column += 1) {
          const height = 0.18 + ((row * 7 + column) % 4) * 0.14;
          const geometry = new THREE.BoxGeometry(0.58, height, 0.58);
          const material = new THREE.MeshStandardMaterial({
            color: palette[(row + column) % palette.length],
            roughness: 0.72,
            metalness: 0.08,
          });
          const block = new THREE.Mesh(geometry, material);
          block.position.set((column - 3) * 0.72, height / 2, (row - 1) * 0.72);
          grid.add(block);
        }
      }
      grid.rotation.y = -0.32;
      scene.add(grid);

      const resize = () => {
        const width = Math.max(container.clientWidth, 1);
        const height = Math.max(container.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const render = (time: number) => {
        if (disposed) return;
        if (!reduced) grid.rotation.y = -0.32 + Math.sin(time * 0.00035) * 0.07;
        renderer.render(scene, camera);
        frame = requestAnimationFrame(render);
      };
      frame = requestAnimationFrame(render);

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver?.disconnect();
        grid.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material))
            material.forEach((item) => item.dispose());
          else material.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="sg-readiness-field"
      data-resource="three"
      aria-hidden="true"
    />
  );
}
