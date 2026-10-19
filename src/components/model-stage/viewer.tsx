"use client";

import { OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import {
  getLightingPreset,
  type LightingPreset,
} from "@/lib/projects/model";
import { STAGE_CAMERA, fitModelToStage } from "./fit";

export type ViewerProps = {
  url: string | null;
  lighting: LightingPreset;
  scale: number;
  offset: [number, number, number];
  variant: "studio" | "toon";
  active: boolean;
  scrollRef: MutableRefObject<number>;
  onProgress: (percent: number) => void;
  onReady: () => void;
};

function toonGradient(): THREE.Texture {
  const texture = new THREE.DataTexture(
    new Uint8Array([36, 120, 204, 255]),
    4,
    1,
    THREE.RedFormat,
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function inkOutlines(
  root: THREE.Object3D,
  gradient: THREE.Texture,
  thickness = 1.035,
) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) meshes.push(child);
  });

  for (const mesh of meshes) {
    const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    const source =
      material instanceof THREE.MeshStandardMaterial
        ? material
        : new THREE.MeshStandardMaterial({ color: "#d8d1c2" });

    mesh.material = new THREE.MeshToonMaterial({
      color: source.color.clone(),
      gradientMap: gradient,
    });

    mesh.geometry.computeBoundingSphere();
    const center = mesh.geometry.boundingSphere?.center ?? new THREE.Vector3();
    const outline = new THREE.Mesh(
      mesh.geometry,
      new THREE.MeshBasicMaterial({ color: "#12100e", side: THREE.BackSide }),
    );
    outline.scale.setScalar(thickness);
    outline.position.copy(center).multiplyScalar(1 - thickness);
    mesh.add(outline);
  }
}

function PreparedModel({
  url,
  variant,
  gradient,
  scale,
  offset,
}: {
  url: string;
  variant: "studio" | "toon";
  gradient: THREE.Texture;
  scale: number;
  offset: [number, number, number];
}) {
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const fit = fitModelToStage({
      size: [size.x, size.y, size.z],
      center: [center.x, center.y, center.z],
    });

    // Center first, then scale a parent group: scaling the clone itself would
    // scale its geometry but not the translation that recenters it.
    clone.position.set(...fit.centerOffset);

    const group = new THREE.Group();
    group.add(clone);
    group.scale.setScalar(fit.scale);
    if (variant === "toon") inkOutlines(group, gradient);
    return group;
  }, [scene, variant, gradient]);

  return (
    // Keep the admin transform on a parent: setting `scale` on the primitive
    // would overwrite the auto-fit scale baked into the model group.
    <group scale={scale} position={[offset[0], offset[1], offset[2]]}>
      <primitive object={model} />
    </group>
  );
}

const shards: { position: [number, number, number]; size: number }[] = [
  { position: [1.6, 0.75, -0.4], size: 0.16 },
  { position: [-1.5, -0.55, 0.35], size: 0.22 },
  { position: [1.15, -0.85, 0.8], size: 0.12 },
  { position: [-1.2, 0.95, -0.7], size: 0.13 },
];

function DefaultModel({
  variant,
  gradient,
}: {
  variant: "studio" | "toon";
  gradient: THREE.Texture;
}) {
  const content = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const toon = variant === "toon";

  useLayoutEffect(() => {
    if (content.current && toon) inkOutlines(content.current, gradient);
  }, [toon, gradient]);

  useFrame((state) => {
    if (!float.current) return;
    float.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.07;
    float.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.04;
  });

  return (
    <group ref={float}>
      <group ref={content}>
        <mesh>
          <icosahedronGeometry args={[1.05, 1]} />
          {toon ? (
            <meshToonMaterial color="#e4dccb" gradientMap={gradient} />
          ) : (
            <meshStandardMaterial
              color="#d8d0bf"
              roughness={0.32}
              metalness={0.35}
            />
          )}
        </mesh>

        <mesh rotation={[Math.PI / 2.7, 0.2, 0]}>
          <torusGeometry args={[1.62, 0.022, 8, 96]} />
          {toon ? (
            <meshToonMaterial color="#e8381f" gradientMap={gradient} />
          ) : (
            <meshStandardMaterial
              color="#e8381f"
              roughness={0.35}
              metalness={0.2}
            />
          )}
        </mesh>

        <mesh rotation={[Math.PI / 1.6, 0.4, 0.5]}>
          <torusGeometry args={[1.42, 0.014, 8, 96]} />
          {toon ? (
            <meshToonMaterial color="#f2a7be" gradientMap={gradient} />
          ) : (
            <meshStandardMaterial
              color="#9aa4c8"
              roughness={0.4}
              metalness={0.2}
            />
          )}
        </mesh>

        {shards.map((shard) => (
          <mesh key={shard.position.join(",")} position={shard.position}>
            <octahedronGeometry args={[shard.size, 0]} />
            {toon ? (
              <meshToonMaterial color="#12100e" gradientMap={gradient} />
            ) : (
              <meshStandardMaterial
                color="#3c3a38"
                roughness={0.5}
                metalness={0.6}
              />
            )}
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Lights({ preset }: { preset: LightingPreset }) {
  const rig = getLightingPreset(preset);

  return (
    <>
      <ambientLight color={rig.ambient} intensity={1.1 * rig.intensity} />
      <directionalLight
        color={rig.key}
        intensity={2.4 * rig.intensity}
        position={[3.5, 5, 4]}
      />
      <directionalLight
        color={rig.fill}
        intensity={1.1 * rig.intensity}
        position={[-4, 1.2, 2.5]}
      />
      <directionalLight
        color={rig.rim}
        intensity={2.1 * rig.intensity}
        position={[-2, 3.4, -5]}
      />
    </>
  );
}

function PointerRig({
  children,
  scrollRef,
}: {
  children: React.ReactNode;
  scrollRef: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const pointer = useThree((state) => state.pointer);

  useFrame(() => {
    if (!group.current) return;
    const tilt = pointer.y * -0.1 + (scrollRef.current - 0.5) * 0.16;
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, tilt, 0.06);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, pointer.x * 0.05, 0.06);
  });

  return <group ref={group}>{children}</group>;
}

function ScrollCamera({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  useFrame((state) => {
    const camera = state.camera;
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const target = STAGE_CAMERA.fov + scrollRef.current * 6;
    if (Math.abs(camera.fov - target) > 0.02) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, target, 0.08);
      camera.updateProjectionMatrix();
    }
  });

  return null;
}

function LoadReporter({
  onProgress,
  onReady,
}: {
  onProgress: (percent: number) => void;
  onReady: () => void;
}) {
  const { progress, active } = useProgress();
  const reported = useRef(0);

  useEffect(() => {
    if (progress !== reported.current) {
      reported.current = progress;
      onProgress(Math.round(progress));
    }
  }, [progress, onProgress]);

  useEffect(() => {
    if (!active && progress === 100) onReady();
  }, [active, progress, onReady]);

  return null;
}

function Ready({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    onReady();
  }, [onReady]);

  return null;
}

export function Viewer({
  url,
  lighting,
  scale,
  offset,
  variant,
  active,
  scrollRef,
  onProgress,
  onReady,
}: ViewerProps) {
  const gradient = useMemo(() => toonGradient(), []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{
        position: [...STAGE_CAMERA.position],
        fov: STAGE_CAMERA.fov,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      resize={{ scroll: false }}
      style={{ position: "absolute", inset: 0, touchAction: "pan-y" }}
    >
      <LoadReporter onProgress={onProgress} onReady={onReady} />
      <Lights preset={lighting} />
      <ScrollCamera scrollRef={scrollRef} />

      <Suspense fallback={null}>
        <PointerRig scrollRef={scrollRef}>
          {url ? (
            <PreparedModel
              url={url}
              variant={variant}
              gradient={gradient}
              scale={scale}
              offset={offset}
            />
          ) : (
            <DefaultModel variant={variant} gradient={gradient} />
          )}
        </PointerRig>
        <Ready onReady={onReady} />
      </Suspense>

      <OrbitControls
        makeDefault
        autoRotate
        autoRotateSpeed={0.55}
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={STAGE_CAMERA.minDistance}
        maxDistance={STAGE_CAMERA.maxDistance}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
}
