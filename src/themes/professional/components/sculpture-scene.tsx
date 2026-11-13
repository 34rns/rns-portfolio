"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { MathUtils, PMREMGenerator, type Group } from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildLogoGeometry } from "./brand-logo/logo-geometry";
import type { SiteSettings } from "@/lib/site-settings/config";

type Props = { active: boolean; exploded: boolean; turn: number; pointer: { x: number; y: number }; settings: SiteSettings; onReady: () => void; onError: () => void; onFrame: (time: number, yaw: number) => void };
function Lighting() {
  const gl = useThree(s => s.gl);
  const target = useMemo(() => {
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(gl);
    const result = generator.fromScene(room, .04);
    room.dispose(); generator.dispose();
    return result;
  }, [gl]);
  useEffect(() => () => target.dispose(), [target]);
  return <Environment map={target.texture} environmentIntensity={1.1} />;
}
function Sculpture({ svg, ...props }: Props & { svg: string }) {
  const model = useMemo(() => buildLogoGeometry(svg, { depth: .5, bevel: .06 }), [svg]);
  const group = useRef<Group>(null);
  const time = useRef(0);
  const ready = useRef(false);
  const width = useThree(s => s.size.width);
  const height = useThree(s => s.size.height);
  const invalidate = useThree(s => s.invalidate);
  const intensity = props.settings.motionIntensity;
  useEffect(() => () => model.parts.forEach(p => p.geometry.dispose()), [model]);
  // Demand rendering needs an explicit frame when a control changes while paused.
  useEffect(() => { invalidate(); }, [invalidate, props.turn, props.exploded, props.active, props.pointer.x, props.pointer.y]);
  useFrame((_, delta) => {
    if (!ready.current) { ready.current = true; props.onReady(); }
    if (props.active) time.current += Math.min(delta, .05);
    if (!group.current) return;
    const t = time.current;
    const blend = props.active ? 1 - Math.exp(-delta * 6) : 1;
    const baseTurn = props.turn * Math.PI / 2;
    group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, -.12 + props.pointer.y * .16 * intensity, blend);
    group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, -.28 + baseTurn + props.pointer.x * .35 * intensity, blend);
    group.current.rotation.z = Math.sin(t * .45) * .016 * intensity;
    group.current.position.y = .16 + Math.sin(t * .65) * .1 * intensity;
    group.current.children.forEach((part, i) => {
      const amount = props.exploded ? 1 : 0;
      const source = model.parts[i];
      part.position.x = MathUtils.lerp(part.position.x, source.center[0] * amount * .2, blend);
      part.position.y = MathUtils.lerp(part.position.y, source.center[1] * amount * .7, blend);
      part.position.z = MathUtils.lerp(part.position.z, (i % 2 ? -.8 : .8) * amount, blend);
    });
    props.onFrame(t, group.current.rotation.y);
  });
  const chrome = props.settings.material === "chrome";
  const faceColor = props.settings.appearance === "paper" ? "#59636f" : chrome ? "#aeb8c5" : "#eef0f2";
  return <>
    <OrthographicCamera makeDefault position={[0, 0, 14]} zoom={Math.min(width / 11, height / 7)} near={.1} far={60} />
    <Lighting />
    <ambientLight intensity={.5} />
    <directionalLight position={[-4, 5, 8]} intensity={3.8} />
    <directionalLight position={[5, -2, 3]} intensity={2} color={props.settings.accent} />
    <group ref={group} rotation={[-.12, -.28, 0]} position={[0, .16, 0]}>
      {model.parts.map((part, i) => <mesh key={i} geometry={part.geometry}>
        <meshPhysicalMaterial attach="material-0" color={part.accent ? props.settings.accent : faceColor} metalness={chrome ? .96 : .12} roughness={chrome ? .12 : .3} clearcoat={1} />
        <meshPhysicalMaterial attach="material-1" color={part.accent ? props.settings.accent : props.settings.appearance === "paper" ? "#424b57" : "#aeb4bb"} metalness={chrome ? .95 : .25} roughness={.24} />
      </mesh>)}
    </group>
    <group position={[0, -2.05, -.6]} rotation={[0, -.28, 0]}>
      <mesh><boxGeometry args={[7.4, .11, 2]} /><meshStandardMaterial color={props.settings.appearance === "paper" ? "#c8c9c4" : "#292c2f"} metalness={.6} roughness={.3} /></mesh>
      <mesh position={[0, -.16, 0]}><boxGeometry args={[8.4, .18, 2.5]} /><meshStandardMaterial color={props.settings.appearance === "paper" ? "#dcddd7" : "#1b1e21"} roughness={.4} /></mesh>
      <mesh position={[3.75, .1, .65]}><boxGeometry args={[.16, .28, .16]} /><meshStandardMaterial color={props.settings.accent} emissive={props.settings.accent} emissiveIntensity={.2} /></mesh>
    </group>
  </>;
}
export default function SculptureScene(props: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const onError = props.onError;
  useEffect(() => {
    const abort = new AbortController();
    fetch("/brand/rns-logo-3d.svg", { signal: abort.signal }).then(r => { if (!r.ok) throw new Error("Missing mark"); return r.text(); }).then(setSvg).catch(e => { if (e.name !== "AbortError") onError(); });
    return () => abort.abort();
  }, [onError]);
  if (!svg) return null;
  return <Canvas dpr={[1, 1.5]} frameloop={props.active ? "always" : "demand"} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} resize={{ scroll: false }} onCreated={({ gl }) => gl.setClearColor("#000000", 0)}><Sculpture {...props} svg={svg} /></Canvas>;
}
