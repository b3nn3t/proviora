"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

export default function SupplementJar({ scrollProgress }: { scrollProgress: number }) {
  const jarRef = useRef<THREE.Group>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Анимация банки при скролле
  useFrame((state) => {
    if (!jarRef.current) return;

    // Базовое вращение
    jarRef.current.rotation.y += 0.005;

    // Scroll-driven анимация
    // 0 to 0.5: Наклон и падение
    // 0.5 to 1.0: Залет внутрь
    
    if (scrollProgress < 0.5) {
      const p = scrollProgress * 2; // 0 to 1
      jarRef.current.rotation.x = p * Math.PI * 0.4; // Наклон вперед
      jarRef.current.position.z = p * 2; // Приближение
      jarRef.current.position.y = -p * 1; // Смещение вниз
    } else {
      const p = (scrollProgress - 0.5) * 2; // 0 to 1
      jarRef.current.position.z = 2 + p * 10; // Залет камеры/банки
      jarRef.current.scale.setScalar(1 + p * 5); // Увеличение для эффекта погружения
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} ref={cameraRef} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#d4af37" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#001233" />

      <group ref={jarRef}>
        {/* Упрощенная модель банки (цилиндр + крышка) */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1, 1, 2.5, 32]} />
          <meshStandardMaterial 
            color="#001233" 
            roughness={0.1} 
            metalness={0.8} 
            emissive="#001233"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Крышка */}
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.4, 32]} />
          <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
        </mesh>

        {/* Этикетка (свечение) */}
        <mesh position={[0, 0, 0.01]}>
          <cylinderGeometry args={[1.01, 1.01, 1.5, 32]} />
          <meshStandardMaterial 
            transparent 
            opacity={0.1} 
            color="#f5e6be" 
            emissive="#f5e6be" 
            emissiveIntensity={0.5} 
          />
        </mesh>
      </group>

      {/* Частицы в воздухе */}
      <Particles count={100} />
    </>
  );
}

function Particles({ count }: { count: number }) {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 1] = (Math.random() - 0.5) * 10;
      temp[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y += 0.001;
      mesh.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#d4af37" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}
