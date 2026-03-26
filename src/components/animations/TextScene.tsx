"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera, Environment, useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

interface TextSceneProps {
  scrollProgress: number;
}

export default function TextScene({ scrollProgress }: TextSceneProps) {
  return (
    <Suspense fallback={null}>
      <LogoContent scrollProgress={scrollProgress} />
    </Suspense>
  );
}

function LogoContent({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/logo.glb");

  // Настройка материалов модели для премиального вида
  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Сохраняем оригинальный материал модели, но добавляем ему свойства для объема
        if (child.material) {
          child.material.metalness = 0.8;
          child.material.roughness = 0.2;
          child.material.side = THREE.DoubleSide;
          child.material.transparent = true;
        }
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useFrame((state) => {
    // Камера влетает ВНУТРЬ 3D логотипа
    const zPos = THREE.MathUtils.lerp(10, -20, scrollProgress);
    state.camera.position.z = zPos;
    
    // Поворачиваем саму группу под углом 45 градусов, чтобы ВСЕГДА видеть объем
    if (groupRef.current) {
      // Базовый наклон в 45 градусов по Y и 20 по X
      groupRef.current.rotation.y = (Math.PI / 4) + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.rotation.x = (Math.PI / 8) + Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
      
      // Дополнительный доворот при скролле
      groupRef.current.rotation.y += scrollProgress * Math.PI;

      const opacity = 1 - Math.pow(scrollProgress, 1.5);
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          child.material.opacity = opacity;
          child.material.transparent = true;
        }
      });
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={45} />
      <ambientLight intensity={0.5} />
      {/* Добавляем боковой свет, чтобы подчеркнуть грани и объем */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={3} color="#ffffff" />
      <pointLight position={[-10, 5, 5]} intensity={2} color="#d4af37" />
      <pointLight position={[0, -5, 5]} intensity={1} color="#ffffff" />
      
      <group ref={groupRef}>
        <Float speed={2} rotationIntensity={1.5} floatIntensity={1}>
          <Center>
            <primitive object={scene} scale={3} />
          </Center>
        </Float>

        <Particles count={500} />
      </group>

      <Environment preset="studio" />
    </>
  );
}

function Particles({ count }: { count: number }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08} 
        color="#d4af37" 
        transparent 
        opacity={0.6} 
        sizeAttenuation 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

useGLTF.preload("/models/logo.glb");
