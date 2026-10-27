import type {
  ActivationRecord,
  LicenseEvent,
  LicenseProject,
  LicenseRecord,
  LicenseStore,
  NewLicense,
} from "@/lib/licensing/store";

const defaultProjects: LicenseProject[] = [
  { slug: "paid-project", status: "published" },
  { slug: "other-project", status: "published" },
  { slug: "draft-project", status: "draft" },
];

/** The same seam the API uses, in memory, with the slot guard intact. */
export function createMemoryLicenseStore({
  projects = defaultProjects,
}: { projects?: LicenseProject[] } = {}) {
  const licenses = new Map<string, LicenseRecord>();
  const activations = new Map<string, ActivationRecord>();
  const events: LicenseEvent[] = [];
  let counter = 0;

  function activationKey(licenseId: string, deviceId: string) {
    return `${licenseId}:${deviceId}`;
  }

  const store: LicenseStore = {
    async findProjectBySlug(slug) {
      return projects.find((project) => project.slug === slug) ?? null;
    },

    async listProjectSlugs() {
      return projects.map((project) => project.slug);
    },

    async findLicenseByLookup(hash) {
      return [...licenses.values()].find((license) => license.keyLookup === hash) ?? null;
    },

    async findLicenseById(id) {
      return licenses.get(id) ?? null;
    },

    async findLicenseByOrderId(orderId) {
      return [...licenses.values()].find((license) => license.orderId === orderId) ?? null;
    },

    async listLicensesByOrderIds(orderIds) {
      return [...licenses.values()].filter(
        (license) => license.orderId && orderIds.includes(license.orderId),
      );
    },

    async createLicense(input: NewLicense) {
      counter += 1;
      const now = new Date();
      const license: LicenseRecord = {
        id: `license_${counter}`,
        ...input,
        activationCount: 0,
        firstActivatedAt: null,
        revokedAt: null,
        revokedReason: null,
        createdAt: now,
        updatedAt: now,
      };
      licenses.set(license.id, license);
      return license;
    },

    async updateLicense(id, patch) {
      const license = licenses.get(id);
      if (!license) return;
      licenses.set(id, { ...license, ...patch, updatedAt: new Date() });
    },

    async findActivation(licenseId, deviceId) {
      return activations.get(activationKey(licenseId, deviceId)) ?? null;
    },

    async createActivation({ licenseId, deviceId, deviceName }) {
      const existing = activations.get(activationKey(licenseId, deviceId));
      if (existing) return { activation: existing, created: false };

      const now = new Date();
      const activation: ActivationRecord = {
        id: `activation_${activations.size + 1}`,
        licenseId,
        deviceId,
        deviceName,
        firstSeen: now,
        lastSeen: now,
      };
      activations.set(activationKey(licenseId, deviceId), activation);
      return { activation, created: true };
    },

    async touchActivation(id, deviceName) {
      for (const [key, activation] of activations) {
        if (activation.id !== id) continue;
        activations.set(key, {
          ...activation,
          deviceName: deviceName ?? activation.deviceName,
          lastSeen: new Date(),
        });
      }
    },

    async claimDeviceSlot(licenseId, maxDevices) {
      const license = licenses.get(licenseId);
      if (!license || license.activationCount >= maxDevices) return false;
      licenses.set(licenseId, { ...license, activationCount: license.activationCount + 1 });
      return true;
    },

    async releaseDeviceSlot(licenseId) {
      const license = licenses.get(licenseId);
      if (!license) return;
      licenses.set(licenseId, {
        ...license,
        activationCount: Math.max(0, license.activationCount - 1),
      });
    },

    async deleteActivation(licenseId, deviceId) {
      activations.delete(activationKey(licenseId, deviceId));
    },

    async listActivations(licenseId) {
      return [...activations.values()].filter((entry) => entry.licenseId === licenseId);
    },

    async listActivationsForLicenses(licenseIds) {
      return [...activations.values()].filter((entry) => licenseIds.includes(entry.licenseId));
    },

    async resetActivations(licenseId) {
      for (const [key, activation] of activations) {
        if (activation.licenseId === licenseId) activations.delete(key);
      }
      const license = licenses.get(licenseId);
      if (license) licenses.set(licenseId, { ...license, activationCount: 0 });
    },

    async listLicenses({ page = 0, perPage = 50 } = {}) {
      return [...licenses.values()]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(page * perPage, page * perPage + perPage);
    },

    async countLicenses() {
      return licenses.size;
    },

    async recordEvent({ licenseId, action, actorEmail, detail }) {
      events.push({
        id: `event_${events.length + 1}`,
        licenseId,
        action,
        actorEmail,
        detail,
        createdAt: new Date(),
      });
    },

    async listEvents(limit = 30) {
      return events.slice(-limit).reverse();
    },
  };

  return { store, licenses, activations, events };
}
