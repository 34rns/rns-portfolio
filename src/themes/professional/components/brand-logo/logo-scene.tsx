"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrthographicCamera } from "@react-three/drei";
import { DataTexture, MathUtils, PMREMGenerator, RGBAFormat, type Group, type MeshPhysicalMaterial, type PointLight } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildLogoGeometry } from "./logo-geometry";

type SceneProps = {
  active: boolean;
  pointer: RefObject<{ x: number; y: number }>;
  scroll: RefObject<number>;
  skipIntro: boolean;
  spin: number;
  onReady: (bytes: number) => void;
  onIdle: () => void;
  onError: () => void;
  onFrame: (data: { time: number; tilt: string; holes: number; parts: number }) => void;
};

function StudioEnvironment() {
  const gl = useThree(state => state.gl);
  const target = useMemo(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const environment = generator.fromScene(room, .04, .1, 100);
    room.dispose(); generator.dispose();
    return environment;
  }, [gl]);
  useEffect(() => () => target.dispose(), [target]);
  return <Environment map={target.texture} environmentIntensity={.8} />;
}

function Logo({ svg, ...props }: SceneProps & { svg: string }) {
  const model = useMemo(() => buildLogoGeometry(svg), [svg]);
  const floor = useMemo(() => {
    const data = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const offset = (y * 64 + x) * 4;
      data[offset] = data[offset + 1] = data[offset + 2] = 255;
      data[offset + 3] = Math.pow(Math.max(0, 1 - Math.hypot((x - 31.5) / 32, (y - 31.5) / 32)), 2) * 255;
    }
    const texture = new DataTexture(data, 64, 64, RGBAFormat); texture.needsUpdate = true;
    return texture;
  }, []);
  const group = useRef<Group>(null);
  const faces = useRef<(MeshPhysicalMaterial | null)[]>([]);
  const sweep = useRef<PointLight>(null);
  const elapsed = useRef(0);
  const notified = useRef(false);
  const finished = useRef(false);
  const spinState = useRef({ command: props.spin, start: -10 });
  const width = useThree(state => state.size.width);
  useEffect(() => () => { model.parts.forEach(part => part.geometry.dispose()); floor.dispose(); }, [model, floor]);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, .05);
    const time = elapsed.current;
    const introTime = props.skipIntro ? 2 : time;
    if (!notified.current && time > .04) { notified.current = true; props.onReady(model.bytes); }
    if (!finished.current && introTime > 1.55) { finished.current = true; props.onIdle(); }
    if (spinState.current.command !== props.spin) spinState.current = { command: props.spin, start: time };
    const spinProgress = Math.min(1, Math.max(0, (time - spinState.current.start) / 1.2));
    const spinAngle = spinProgress < 1 ? (1 - Math.pow(1 - spinProgress, 3)) * Math.PI * 2 : 0;
    const p = props.pointer.current;
    const scroll = props.scroll.current;
    if (group.current) {
      const blend = 1 - Math.exp(-delta * 7);
      group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, .12 + p.y * .11 + Math.sin(time * .7) * .025, blend);
      group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, -.26 + p.x * .25 + scroll * .65 + Math.sin(time * .55) * .055, blend);
      group.current.rotation.z = MathUtils.lerp(group.current.rotation.z, -.025 + p.x * .022, blend);
      group.current.position.y = Math.sin(time * .8) * .045;
      group.current.children.forEach((mesh, i) => {
        const progress = Math.max(0, Math.min(1, (introTime - i * .045) / .85));
        const settle = 1 - Math.pow(1 - progress, 3);
        const offset = 1 - settle;
        mesh.position.set(model.parts[i].center[0] * offset * .18, (i % 2 ? -.3 : .3) * offset + Math.sin(progress * Math.PI) * .03, offset * .45);
        mesh.rotation.y = -offset * .4 + spinAngle;
        faces.current[i]!.opacity = Math.min(1, progress * 3);
      });
    }
    if (sweep.current) { sweep.current.position.x = -5 + Math.min(1, introTime / 1.5) * 10; sweep.current.intensity = introTime < 1.8 ? 9 : 1; }
    props.onFrame({ time, tilt: `${group.current?.rotation.x.toFixed(3)},${group.current?.rotation.y.toFixed(3)}`, holes: model.parts.reduce((sum, part) => sum + part.holes, 0), parts: model.parts.length });
  });

  return <>
    <OrthographicCamera makeDefault position={[0, 1.3, 12]} rotation={[-.1, 0, 0]} zoom={width / 9.2} near={.1} far={50} />
    <StudioEnvironment />
    <ambientLight intensity={.2} />
    <directionalLight position={[-3, 4, 6]} intensity={1.5} color="#FFFFFF" />
    <directionalLight position={[4, 1, -2]} intensity={2.5} color="#FFFFFF" />
    <pointLight position={[-4, -1, 3]} intensity={4} color="#FFC900" distance={12} />
    <pointLight ref={sweep} position={[-5, 2, 3]} intensity={9} color="#FFFFFF" distance={10} />
    <group ref={group}>
      {model.parts.map((part, index) => <mesh key={index} geometry={part.geometry}>
        <meshPhysicalMaterial ref={node => { faces.current[index] = node; }} attach="material-0" color={part.accent ? "#FFC900" : "#FFFFFF"} metalness={part.accent ? .45 : .3} roughness={part.accent ? .28 : .32} clearcoat={.65} clearcoatRoughness={.22} iridescence={part.accent ? .12 : .04} iridescenceIOR={1.3} iridescenceThicknessRange={[120, 360]} transparent />
        <meshPhysicalMaterial attach="material-1" color={part.accent ? "#FFC900" : "#F3F4F5"} metalness={.85} roughness={.23} clearcoat={.4} />
      </mesh>)}
    </group>
    <mesh position={[0, -1.7, -.35]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[10, 6]} /><meshBasicMaterial color="#17191C" map={floor} transparent opacity={.65} depthWrite={false} /></mesh>
    <ContactShadows position={[0, -1.69, -.35]} opacity={.25} scale={11} blur={2.5} resolution={128} frames={1} far={4} color="#000000" />
  </>;
}

export function LogoScene(props: SceneProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const { onError } = props;
  useEffect(() => {
    const abort = new AbortController();
    fetch("/brand/rns-logo-3d.svg", { signal: abort.signal }).then(response => { if (!response.ok) throw new Error("Logo SVG unavailable"); return response.text(); }).then(setSvg).catch(error => { if (error.name !== "AbortError") onError(); });
    return () => abort.abort();
  }, [onError]);
  if (!svg) return null;
  return <Canvas dpr={[1, 1.5]} frameloop={props.active ? "always" : "never"} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} resize={{ scroll: false }} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} onCreated={({ gl }) => gl.setClearColor("#000000", 0)}><Logo svg={svg} {...props} /></Canvas>;
}
