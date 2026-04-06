import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HyperspeedProps {
  effectOptions: any;
}

export function Hyperspeed({ effectOptions }: HyperspeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      effectOptions.fov || 90,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    );
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create light trails
    const createTrail = (color: number, x: number, y: number) => {
      const points = [];
      for (let i = 0; i < 100; i++) {
        points.push(new THREE.Vector3(x, y, -i * 100));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color, linewidth: 2, transparent: true, opacity: 0.6 });
      const line = new THREE.Line(geometry, material);
      return line;
    };

    const trails: THREE.Line[] = [];
    const colors = [...effectOptions.colors.leftCars, ...effectOptions.colors.rightCars];
    
    for (let i = 0; i < 100; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const x = (Math.random() - 0.5) * 500;
      const y = (Math.random() - 0.5) * 500;
      const trail = createTrail(color, x, y);
      scene.add(trail);
      trails.push(trail);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      
      trails.forEach(trail => {
        trail.position.z += 10;
        if (trail.position.z > 500) {
          trail.position.z = -5000;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [effectOptions]);

  return <div ref={containerRef} className="w-full h-full" />;
}
