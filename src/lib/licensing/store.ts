export type LicenseType = "permanent" | "timelimited";
export type LicenseStatus = "unused" | "active" | "expired" | "revoked";

export const LICENSE_STATUSES = ["unused", "active", "expired", "revoked"] as const;
export const LICENSE_TYPES = ["permanent", "timelimited"] as const;
export const LICENSE_DAYS_PRESETS = [30, 90, 365] as const;
export const DEFAULT_MAX_DEVICES = 2;

export function isLicenseStatus(value: string): value is LicenseStatus {
  return (LICENSE_STATUSES as readonly string[]).includes(value);
}

export function isLicenseType(value: string): value is LicenseType {
  return (LICENSE_TYPES as readonly string[]).includes(value);
}

export type LicenseEventAction =
  | "created"
  | "activated"
  | "revoked"
  | "unrevoked"
  | "extended"
  | "devices_reset"
  | "key_shown";

export type LicenseRecord = {
  id: string;
  keyLookup: string;
  keyCiphertext: string;
  projectSlugs: string[];
  type: LicenseType;
  days: number | null;
  activateBy: Date | null;
  maxDevices: number;
  activationCount: number;
  firstActivatedAt: Date | null;
  revokedAt: Date | null;
  revokedReason: string | null;
  note: string | null;
  orderId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewLicense = {
  keyLookup: string;
  keyCiphertext: string;
  projectSlugs: string[];
  type: LicenseType;
  days: number | null;
  activateBy: Date | null;
  maxDevices: number;
  note: string | null;
  orderId: string | null;
};

export type LicenseProject = {
  slug: string;
  status: "draft" | "published";
};

export type ActivationRecord = {
  id: string;
  licenseId: string;
  deviceId: string;
  deviceName: string | null;
  firstSeen: Date;
  lastSeen: Date;
};

export type LicenseEvent = {
  id: string;
  licenseId: string;
  action: LicenseEventAction;
  actorEmail: string;
  detail: string | null;
  createdAt: Date;
};

export type LicenseRow = LicenseRecord & {
  /** Resolved in the page, not the store, so the store stays a thin seam. */
  status: LicenseStatus;
};

export type LicensePatch = {
  revokedAt?: Date | null;
  revokedReason?: string | null;
  days?: number | null;
  activateBy?: Date | null;
  maxDevices?: number;
  note?: string | null;
  firstActivatedAt?: Date | null;
  activationCount?: number;
};

/**
 * Persistence seam. Activation uses `claimDeviceSlot`, a single guarded update,
 * because the app runs on a serverless driver without transactions: the device
 * limit has to hold under concurrent requests without one.
 */
export interface LicenseStore {
  findProjectBySlug(slug: string): Promise<LicenseProject | null>;
  listProjectSlugs(): Promise<string[]>;
  findLicenseByLookup(hash: string): Promise<LicenseRecord | null>;
  findLicenseById(id: string): Promise<LicenseRecord | null>;
  findLicenseByOrderId(orderId: string): Promise<LicenseRecord | null>;
  listLicensesByOrderIds(orderIds: string[]): Promise<LicenseRecord[]>;
  createLicense(input: NewLicense): Promise<LicenseRecord>;
  updateLicense(id: string, patch: LicensePatch): Promise<void>;
  findActivation(licenseId: string, deviceId: string): Promise<ActivationRecord | null>;
  /** `created: false` means this device was already activated. */
  createActivation(input: {
    licenseId: string;
    deviceId: string;
    deviceName: string | null;
  }): Promise<{ activation: ActivationRecord; created: boolean }>;
  touchActivation(id: string, deviceName: string | null): Promise<void>;
  /** True when a slot was taken; false when the device limit is reached. */
  claimDeviceSlot(licenseId: string, maxDevices: number): Promise<boolean>;
  /** Hands a slot back after a failed claim (the insert lost a race). */
  releaseDeviceSlot(licenseId: string): Promise<void>;
  deleteActivation(licenseId: string, deviceId: string): Promise<void>;
  listActivations(licenseId: string): Promise<ActivationRecord[]>;
  /** One query for a whole admin page instead of one per key. */
  listActivationsForLicenses(licenseIds: string[]): Promise<ActivationRecord[]>;
  resetActivations(licenseId: string): Promise<void>;
  listLicenses(args: {
    status?: LicenseStatus;
    query?: string;
    page?: number;
    perPage?: number;
  }): Promise<LicenseRecord[]>;
  countLicenses(args: { status?: LicenseStatus; query?: string }): Promise<number>;
  recordEvent(input: {
    licenseId: string;
    action: LicenseEventAction;
    actorEmail: string;
    detail: string | null;
  }): Promise<void>;
  listEvents(limit?: number): Promise<LicenseEvent[]>;
}
