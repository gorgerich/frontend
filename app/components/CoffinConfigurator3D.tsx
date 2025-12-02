"use client";

import React, { useRef, useState } from "react";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import * as THREE from "three";

type Part = "coffin" | "lining" | "wreath" | null;

interface SceneProps {
  onSelectPart: (part: Part) => void;
}

function Scene({ onSelectPart }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredPart, setHoveredPart] = useState<Part | null>(null);

  const handleClick =
    (part: Part) =>
    (e: ThreeEvent<MouseEvent>): void => {
      e.stopPropagation();
      onSelectPart(part);
    };

  const handlePointerOver =
    (part: Part) =>
    (e: ThreeEvent<MouseEvent>): void => {
      e.stopPropagation();
      setHoveredPart(part);
      document.body.style.cursor = "pointer";
    };

  const handlePointerOut = (e: ThreeEvent<MouseEvent>): void => {
    e.stopPropagation();
    setHoveredPart(null);
    document.body.style.cursor = "default";
  };

  return (
    <group ref={groupRef} rotation={[0, Math.PI / 6, 0]}>
      {/* Пол зала */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#f2f0ea" />
      </mesh>

      {/* Подиум под гроб */}
      <mesh position={[0, -0.25, 0]} receiveShadow castShadow>
        <boxGeometry args={[4, 0.3, 1.4]} />
        <meshStandardMaterial color="#3a302a" />
      </mesh>

      {/* Гроб (корпус) */}
      <mesh
        position={[0, 0.2, 0]}
        castShadow
        onClick={handleClick("coffin")}
        onPointerOver={handlePointerOver("coffin")}
        onPointerOut={handlePointerOut}
      >
        {/* Прямоугольная основа */}
        <boxGeometry args={[3.2, 0.4, 1.0]} />
        <meshStandardMaterial
          color={hoveredPart === "coffin" ? "#b37a42" : "#8b5a2b"}
          metalness={0.2}
          roughness={0.45}
        />
      </mesh>

      {/* Крышка гроба, приоткрыта */}
      <mesh
        position={[0, 0.45, -0.15]}
        rotation={[THREE.MathUtils.degToRad(-35), 0, 0]}
        castShadow
        onClick={handleClick("coffin")}
        onPointerOver={handlePointerOver("coffin")}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[3.1, 0.08, 0.9]} />
        <meshStandardMaterial
          color={hoveredPart === "coffin" ? "#c4873f" : "#996633"}
          metalness={0.25}
          roughness={0.4}
        />
      </mesh>

      {/* Обивка внутри */}
      <mesh
        position={[0, 0.25, 0]}
        castShadow
        onClick={handleClick("lining")}
        onPointerOver={handlePointerOver("lining")}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[3.0, 0.26, 0.8]} />
        <meshStandardMaterial
          color={hoveredPart === "lining" ? "#ffffff" : "#f8f3f5"}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>

      {/* Венок слева */}
      <group
        position={[-2.3, 0.7, -0.3]}
        rotation={[0, THREE.MathUtils.degToRad(20), 0]}
        onClick={handleClick("wreath")}
        onPointerOver={handlePointerOver("wreath")}
        onPointerOut={handlePointerOut}
      >
        {/* Каркас венка */}
        <mesh castShadow>
          <torusGeometry args={[0.7, 0.12, 16, 48]} />
          <meshStandardMaterial
            color="#1c3b19"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>

        {/* Цветы – несколько маленьких сфер по кругу */}
        {Array.from({ length: 18 }).map((_, i) => {
          const angle = (i / 18) * Math.PI * 2;
          const radius = 0.65;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isAccent = i % 3 === 0;
          return (
            <mesh key={i} position={[x, y, 0.1]} castShadow>
              <sphereGeometry args={[0.09, 14, 14]} />
              <meshStandardMaterial
                color={isAccent ? "#d62828" : "#f7f3e9"}
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Венок справа (чуть другой по цвету) */}
      <group
        position={[2.3, 0.7, -0.5]}
        rotation={[0, THREE.MathUtils.degToRad(-10), 0]}
        onClick={handleClick("wreath")}
        onPointerOver={handlePointerOver("wreath")}
        onPointerOut={handlePointerOut}
      >
        <mesh castShadow>
          <torusGeometry args={[0.6, 0.11, 16, 40]} />
          <meshStandardMaterial
            color="#1c3b19"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const radius = 0.55;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <mesh key={i} position={[x, y, 0.08]} castShadow>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial color="#e63946" />
            </mesh>
          );
        })}
      </group>

      {/* Лёгкая "стена" на заднем плане */}
      <mesh position={[0, 1.1, -4.5]} receiveShadow>
        <boxGeometry args={[10, 3, 0.2]} />
        <meshStandardMaterial color="#d9d4cc" />
      </mesh>
    </group>
  );
}

const CoffinConfigurator3D: React.FC = () => {
  const [activePart, setActivePart] = useState<Part>(null);

  return (
    <div className="w-full">
      <div className="w-full h-[360px] rounded-2xl bg-black/90 overflow-hidden border border-white/10">
        <Canvas
          camera={{ position: [4, 2.5, 5], fov: 40 }}
          shadows
          dpr={[1, 2]}
        >
          <color attach="background" args={["#050509"]} />
          <ambientLight intensity={0.5} />
          <spotLight
            intensity={1.1}
            angle={0.4}
            penumbra={0.5}
            position={[3, 6, 4]}
            castShadow
          />
          <Stage
            intensity={0.3}
            environment={null}
            adjustCamera={false}
            shadows="contact"
          >
            <Scene onSelectPart={setActivePart} />
          </Stage>
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={Math.PI / 5}
            minDistance={4}
            maxDistance={7}
          />
        </Canvas>
      </div>

      <div className="mt-3 text-xs text-white/70 text-center space-y-1">
        {activePart === null && (
          <p>
            Поверните зал одним пальцем и нажмите на объект: гроб, обивку или
            венок.
          </p>
        )}
        {activePart === "coffin" && <p>Выбран гроб — дальше покажем выбор цвета корпуса.</p>}
        {activePart === "lining" && (
          <p>Выбрана внутренняя обивка — можно будет выбрать ткань и оттенок.</p>
        )}
        {activePart === "wreath" && (
          <p>Выбран венок — откроем подбор цветов и композиций.</p>
        )}
      </div>
    </div>
  );
};

export default CoffinConfigurator3D;