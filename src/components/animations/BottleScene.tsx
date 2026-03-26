"use client";

import { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, ContactShadows, Environment, useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";

interface BottleSceneProps {
  scrollProgress: number;
}

export default function BottleScene({ scrollProgress }: BottleSceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 4]} fov={45} />
      
      {/* Освещение */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <pointLight position={[0, 5, -5]} intensity={2} color="#ffffff" />
      <pointLight position={[-5, 0, 2]} intensity={1} color="#d4af37" />

      <Suspense fallback={null}>
        <SceneContent scrollProgress={scrollProgress} />
      </Suspense>

      <ContactShadows 
        position={[0, -1.5, 0]} 
        opacity={0.4} 
        scale={10} 
        blur={2} 
        far={4} 
      />
      <Environment preset="studio" />
    </>
  );
}

function SceneContent({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Bottle scrollProgress={scrollProgress} />
      <Capsules scrollProgress={scrollProgress} />
    </group>
  );
}

function Bottle({ scrollProgress }: { scrollProgress: number }) {
  const { scene, nodes, materials } = useGLTF("/models/jar_model.glb");
  const lidRef = useRef<THREE.Object3D>(null);
  const bodyRef = useRef<THREE.Group>(null);

  // Пытаемся найти крышку и корпус в модели автоматически или по именам
  // Если в модели другие имена, можно заменить 'Lid' и 'Body'
  const lidObject = nodes.Lid || nodes.lid || nodes.Cap || nodes.cap || scene.children.find(c => c.name.toLowerCase().includes('lid'));
  const bodyObject = nodes.Body || nodes.body || nodes.Jar || nodes.jar || scene.children.find(c => c.name.toLowerCase().includes('body') || c.name.toLowerCase().includes('jar'));

  useFrame(() => {
    if (!bodyRef.current) return;

    const p = scrollProgress;
    
    // Наклон всей банки
    bodyRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI * 0.3, p);
    bodyRef.current.position.y = THREE.MathUtils.lerp(0, -0.3, p);

    // Анимация крышки (0.1 -> 0.4)
    if (lidRef.current) {
      if (p > 0.1) {
        const lp = Math.min((p - 0.1) * 3.3, 1);
        const easeLp = 1 - Math.pow(1 - lp, 3);
        lidRef.current.position.y = 1.3 + easeLp * 2.5; // Поднимаем вверх
        lidRef.current.position.z = -easeLp * 1.5;      // Отводим назад
        lidRef.current.rotation.y = easeLp * Math.PI * 4; // Вращаем (откручиваем)
      } else {
        lidRef.current.position.set(0, 1.3, 0);
        lidRef.current.rotation.set(0, 0, 0);
      }
    }
  });

  // Принудительно задаем цвета, если модель пришла без них или не тех цветов
  useMemo(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.name.toLowerCase().includes('lid') || child.name.toLowerCase().includes('cap')) {
          child.material = new THREE.MeshStandardMaterial({
            color: "#d4af37",
            metalness: 0.7,
            roughness: 0.3
          });
        } else {
          child.material = new THREE.MeshStandardMaterial({
            color: "#0b1f3a",
            metalness: 0.3,
            roughness: 0.6
          });
        }
      }
    });
  }, [scene]);

  return (
    <group ref={bodyRef}>
      {/* Если модель загрузилась как единая сцена, мы можем управлять её частями через рефы */}
      <primitive object={scene} scale={1.5} />
      {/* Добавляем невидимый реф на крышку для анимации, если нашли её */}
      {lidObject && <primitive object={lidObject} ref={lidRef} />}
    </group>
  );
}

function Capsules({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = 35;

  const data = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        startPos: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 1.2,
          (Math.random() - 0.5) * 0.6
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2.5,
          -6 - Math.random() * 4,
          3 + Math.random() * 3
        ),
        scale: 0.08 + Math.random() * 0.04,
        delay: Math.random() * 0.3,
      });
    }
    return items;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    const p = scrollProgress;

    groupRef.current.children.forEach((child, i) => {
      const d = data[i];
      const startT = 0.3 + d.delay;

      if (p > startT) {
        const cp = Math.min((p - startT) / (0.7 - d.delay), 1);
        
        child.position.x = d.startPos.x + d.velocity.x * cp;
        child.position.y = d.startPos.y + d.velocity.y * cp;
        child.position.z = d.startPos.z + d.velocity.z * cp + 0.2;
        
        child.rotation.x += 0.03;
        child.rotation.y += 0.02;

        if (cp > 0.8) {
          child.scale.setScalar(d.scale * (1 - (cp - 0.8) * 5));
        } else {
          child.scale.setScalar(d.scale);
        }
        child.visible = true;
      } else {
        child.position.copy(d.startPos);
        child.rotation.copy(d.rotation);
        child.scale.setScalar(d.scale);
        child.visible = p > 0.25; 
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((_, i) => (
        <mesh key={i} renderOrder={1} castShadow>
          <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
          <meshStandardMaterial 
            color="#f5e6be" 
            emissive="#f5e6be" 
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Предзагрузка модели для оптимизации
useGLTF.preload("/models/jar_model.glb");
