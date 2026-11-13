export type LogoCapability = { reducedMotion: boolean; cores: number; memory: number; saveData: boolean; webgl: boolean };
export function canAnimateLogo(capability: LogoCapability) {
  return !capability.reducedMotion && capability.cores > 4 && capability.memory >= 4 && !capability.saveData && capability.webgl;
}
