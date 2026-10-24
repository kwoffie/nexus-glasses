import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/* Rounded rectangle outline, centered on the origin. */
function roundedRect(w: number, h: number, r: number): THREE.Shape {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const P = Math.PI;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.absarc(x + w - r, y + r, r, -P / 2, 0, false);
  s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, P / 2, false);
  s.lineTo(x + r, y + h);
  s.absarc(x + r, y + h - r, r, P / 2, P, false);
  s.lineTo(x, y + r);
  s.absarc(x + r, y + r, r, P, P * 1.5, false);
  return s;
}

function ringGeometry(
  outer: [number, number, number],
  inner: [number, number, number],
  depth: number,
  bevel = 0
) {
  const shape = roundedRect(...outer);
  shape.holes.push(roundedRect(...inner));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 28,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

const LX = 0.95; // lens center offset from the middle of the bridge

export const COLORWAYS = {
  midnight: { name: "Midnight", frame: "#0d1a38", accent: "#22d3ee", sec: "#6366f1", lens: "#1b5f86" },
  aurora: { name: "Aurora", frame: "#0b2a22", accent: "#34d399", sec: "#22d3ee", lens: "#1b7a5f" },
  sunset: { name: "Sunset", frame: "#2a1020", accent: "#fb923c", sec: "#f43f5e", lens: "#9a3f2a" },
  violet: { name: "Violet", frame: "#1a1038", accent: "#a78bfa", sec: "#ec4899", lens: "#5b3a9a" },
  gold: { name: "Gold", frame: "#2b2110", accent: "#fbbf24", sec: "#f59e0b", lens: "#8a6a1a" },
  arctic: { name: "Arctic", frame: "#dfe8f5", accent: "#38bdf8", sec: "#94a3b8", lens: "#5aa0c8" },
  graphite: { name: "Graphite", frame: "#1f232b", accent: "#e5e7eb", sec: "#9ca3af", lens: "#4b5563" },
} as const;

export type ColorwayKey = keyof typeof COLORWAYS;

function Glasses({ hud = true, colorway = "midnight" }: { hud?: boolean; colorway?: ColorwayKey }) {
  const c = COLORWAYS[colorway];
  const darkFrame = useMemo(() => "#" + new THREE.Color(c.frame).multiplyScalar(0.5).getHexString(), [c.frame]);
  const hudColor = useMemo(() => "#" + new THREE.Color(c.accent).lerp(new THREE.Color("#ffffff"), 0.55).getHexString(), [c.accent]);
  const body = useRef<THREE.Group>(null);
  const accentMat = useRef<THREE.MeshStandardMaterial>(null);

  const geo = useMemo(
    () => ({
      frame: ringGeometry([1.6, 1.2, 0.38], [1.38, 0.98, 0.27], 0.16, 0.03),
      accent: ringGeometry([1.52, 1.12, 0.34], [1.45, 1.05, 0.3], 0.02),
      lens: new THREE.ShapeGeometry(roundedRect(1.4, 1.0, 0.28), 28),
      bridge: new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2, 0.18, 0),
          new THREE.Vector3(-0.08, 0.3, 0.01),
          new THREE.Vector3(0.08, 0.3, 0.01),
          new THREE.Vector3(0.2, 0.18, 0),
        ]),
        24,
        0.04,
        12,
        false
      ),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (body.current) body.current.position.y = Math.sin(t * 1.3) * 0.05;
    if (accentMat.current) {
      accentMat.current.emissiveIntensity = hud ? 1.2 + Math.sin(t * 2.2) * 0.35 : 0.25;
    }
  });

  const frameMat = <meshStandardMaterial color={c.frame} metalness={0.6} roughness={0.3} />;
  const darkMat = <meshStandardMaterial color={darkFrame} metalness={0.4} roughness={0.45} />;

  return (
    <group ref={body}>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh geometry={geo.frame} position={[side * LX, 0, 0]}>
            {frameMat}
          </mesh>
          <mesh geometry={geo.accent} position={[side * LX, 0, 0.115]}>
            <meshStandardMaterial
              ref={side === 1 ? accentMat : undefined}
              color={c.accent}
              emissive={c.accent}
              emissiveIntensity={1.4}
            />
          </mesh>
          <mesh geometry={geo.lens} position={[side * LX, 0, 0]}>
            <meshPhysicalMaterial
              color={c.lens}
              transparent
              opacity={0.34}
              roughness={0.05}
              clearcoat={1}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* hinge, temple arm, ear tip */}
          <mesh position={[side * 1.8, 0.22, -0.02]}>
            <cylinderGeometry args={[0.065, 0.065, 0.2, 20]} />
            {darkMat}
          </mesh>
          <mesh position={[side * 1.81, 0.22, -0.98]} rotation={[0, -side * 0.035, 0]}>
            <boxGeometry args={[0.1, 0.15, 1.9]} />
            {frameMat}
          </mesh>
          <mesh position={[side * 1.78, 0.07, -2.08]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.095, 0.12, 0.55]} />
            {darkMat}
          </mesh>
          <mesh position={[side * 1.855, 0.22, -0.95]}>
            <boxGeometry args={[0.012, 0.035, 1.0]} />
            <meshStandardMaterial color={c.sec} emissive={c.sec} emissiveIntensity={1.2} />
          </mesh>

          {/* nose pad */}
          <mesh position={[side * 0.2, -0.3, -0.08]} scale={[0.8, 1.6, 0.8]}>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshStandardMaterial color="#9fdcff" transparent opacity={0.55} roughness={0.2} />
          </mesh>
        </group>
      ))}

      <mesh geometry={geo.bridge}>{frameMat}</mesh>

      {/* camera module, right frame upper outer corner */}
      <group position={[LX + 0.6, 0.46, 0.14]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.07, 28]} />
          {darkMat}
        </mesh>
        <mesh position={[0, 0, 0.038]}>
          <torusGeometry args={[0.075, 0.012, 10, 32]} />
          <meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={1.4} />
        </mesh>
        <mesh position={[0, 0, 0.04]}>
          <sphereGeometry args={[0.04, 16, 12]} />
          <meshStandardMaterial color="#02050f" metalness={0.9} roughness={0.05} />
        </mesh>
      </group>

      {/* HUD elements inside the lenses */}
      {hud && (
        <group>
          {(
            [
              [-LX - 0.2, 0.26, 0.62, 0.028],
              [-LX - 0.3, 0.16, 0.42, 0.02],
              [-LX - 0.27, 0.07, 0.48, 0.02],
              [LX + 0.12, -0.3, 0.5, 0.02],
            ] as const
          ).map(([x, y, w, h], i) => (
            <mesh key={i} position={[x, y, 0.012]}>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial color={hudColor} transparent opacity={0.9} />
            </mesh>
          ))}
          <mesh position={[LX + 0.12, 0.02, 0.012]}>
            <ringGeometry args={[0.17, 0.195, 48]} />
            <meshBasicMaterial color={hudColor} transparent opacity={0.9} />
          </mesh>
          <mesh position={[LX + 0.12, 0.02, 0.012]}>
            <circleGeometry args={[0.035, 24]} />
            <meshBasicMaterial color={hudColor} transparent opacity={0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

type Props = {
  className?: string;
  hud?: boolean;
  autoRotate?: boolean;
  colorway?: ColorwayKey;
};

export default function NexusGlasses({ className, hud = true, autoRotate = true, colorway = "midnight" }: Props) {
  const c = COLORWAYS[colorway];
  return (
    <div className={className} style={{ width: "100%", minHeight: 320 }}>
      <Canvas camera={{ position: [0, 0.25, 5.6], fov: 38 }} dpr={[1, 2]}>
        <hemisphereLight args={["#9fdcff", "#0a1230", 0.9]} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight position={[-4, 1, -3]} intensity={30} color={c.accent} />
        <pointLight position={[4, -1, -3]} intensity={30} color={c.sec} />
        <ambientLight intensity={0.35} />
        <group rotation={[0.12, -0.5, 0]}>
          <Glasses hud={hud} colorway={colorway} />
        </group>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          minPolarAngle={0.5}
          maxPolarAngle={Math.PI - 0.8}
        />
      </Canvas>
    </div>
  );
}
