/**
 * Camera and framing constants. The fit math below has to know the default
 * camera, so keep both in one place and pass the same values to <Canvas>.
 */
export const STAGE_CAMERA = {
  fov: 38,
  position: [0, 0.35, 4.4] as [number, number, number],
  minDistance: 2.4,
  maxDistance: 6.5,
} as const;

/** How much of the viewport height a normalized model should fill. */
export const MODEL_HEIGHT_FRACTION = 0.7;

export type ModelSize = [number, number, number];
export type ModelCenter = [number, number, number];

export type ModelFit = {
  /** Uniform multiplier that turns the model's own units into stage units. */
  scale: number;
  /** Translation, before scaling, that puts the model's bounding-box center at 0,0,0. */
  centerOffset: ModelCenter;
};

const EPSILON = 1e-6;

/** World-space height visible at the orbit target for the default camera. */
export function stageVisibleHeight(
  fov: number = STAGE_CAMERA.fov,
  position: ModelCenter = STAGE_CAMERA.position,
): number {
  const distance = Math.hypot(position[0], position[1], position[2]);
  return 2 * distance * Math.tan((fov * Math.PI) / 360);
}

/**
 * Normalize a model whatever units the exporter used. Height is the primary
 * dimension, because the stage is wider than it is tall; flat or zero-height
 * meshes fall back to their longest footprint so they still become visible.
 *
 * The caller applies `centerOffset` first and then `scale` to a parent group,
 * which is equivalent to scaling the center by the same factor and keeps every
 * model centered no matter how far its own root node sits from the origin.
 */
export function fitModelToStage(
  { size, center }: { size: ModelSize; center: ModelCenter },
  { heightFraction = MODEL_HEIGHT_FRACTION, visibleHeight = stageVisibleHeight() } = {},
): ModelFit {
  const [width, height, depth] = size;
  const [x, y, z] = center;

  if (![width, height, depth, x, y, z].every(Number.isFinite)) {
    return { scale: 1, centerOffset: [0, 0, 0] };
  }

  const base = height > EPSILON ? height : Math.max(width, depth);
  if (base <= EPSILON) {
    return { scale: 1, centerOffset: [0, 0, 0] };
  }

  return {
    scale: (visibleHeight * heightFraction) / base,
    centerOffset: [-x, -y, -z],
  };
}
