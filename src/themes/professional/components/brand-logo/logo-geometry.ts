import { Box2, BufferGeometry, ExtrudeGeometry, Path, Shape, ShapeUtils, Vector2 } from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Extrusion = { depth: number; bevel: number };
export function extrudeShape(shape: Shape, options?: Extrusion): BufferGeometry {
  const depth = options?.depth ?? .14;
  const raw = new ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelThickness: options?.bevel ?? .02, bevelSize: options?.bevel ?? .014, bevelSegments: 3, curveSegments: 1 });
  raw.translate(0, 0, -depth / 2);
  raw.deleteAttribute("uv");
  const geometry = mergeVertices(raw, .00001);
  raw.dispose();
  return geometry;
}

export function geometryBytes(geometry: BufferGeometry) {
  return Object.values(geometry.attributes).reduce((sum, attribute) => sum + attribute.array.byteLength, 0) + (geometry.index?.array.byteLength ?? 0);
}

// Decimate closed contours without changing ring order or dropping their holes.
function simplifyOpen(points: Vector2[], epsilon: number): Vector2[] {
  if (points.length <= 2) return points;
  const first = points[0], last = points[points.length - 1];
  const segment = last.clone().sub(first);
  let maximum = 0, split = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const t = segment.lengthSq() ? Math.max(0, Math.min(1, points[i].clone().sub(first).dot(segment) / segment.lengthSq())) : 0;
    const distance = points[i].distanceTo(first.clone().addScaledVector(segment, t));
    if (distance > maximum) { maximum = distance; split = i; }
  }
  return maximum > epsilon ? [...simplifyOpen(points.slice(0, split + 1), epsilon).slice(0, -1), ...simplifyOpen(points.slice(split), epsilon)] : [first, last];
}

function ring(points: Vector2[], center: Vector2, scale: number) {
  const normalized = points.map(p => new Vector2((p.x - center.x) * scale, (center.y - p.y) * scale));
  if (normalized[0].distanceTo(normalized[normalized.length - 1]) < .00001) normalized.pop();
  let farthest = 1;
  for (let i = 2; i < normalized.length; i++) if (normalized[i].distanceToSquared(normalized[0]) > normalized[farthest].distanceToSquared(normalized[0])) farthest = i;
  return [...simplifyOpen(normalized.slice(0, farthest + 1), .008).slice(0, -1), ...simplifyOpen([...normalized.slice(farthest), normalized[0]], .008).slice(0, -1)];
}

export function buildLogoGeometry(svg: string, extrusion?: Extrusion) {
  const parsed = new SVGLoader().parse(svg);
  const originals = parsed.paths.flatMap(path => path.toShapes().map(shape => ({ shape, accent: path.color.getHexString().toLowerCase() === "ffc900" })));
  const box = new Box2().setFromPoints(originals.flatMap(p => p.shape.getPoints(3)));
  const center = box.getCenter(new Vector2());
  const size = box.getSize(new Vector2());
  if (!originals.length || !size.x) throw new Error("Logo SVG has no valid shapes");
  const scale = 8 / size.x;
  const parts = originals.flatMap(({ shape, accent }) => {
    const outer = ring(shape.getPoints(3), center, scale);
    if (outer.length < 3 || Math.abs(ShapeUtils.area(outer)) < .001) return [];
    const normalized = new Shape(outer);
    normalized.holes = shape.holes.map(hole => new Path(ring(hole.getPoints(3), center, scale)));
    const geometry = extrudeShape(normalized, extrusion);
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox!;
    return [{ geometry, accent, center: [(bounds.min.x + bounds.max.x) / 2, (bounds.min.y + bounds.max.y) / 2] as [number, number], holes: normalized.holes.length }];
  });
  const bytes = parts.reduce((sum, part) => sum + geometryBytes(part.geometry), 0);
  if (bytes > 300_000) {
    parts.forEach(part => part.geometry.dispose());
    throw new Error("Logo geometry exceeds its 300 KB budget");
  }
  return { parts, bytes, height: size.y * scale };
}
