export type ModelRecord = {
  id: string;
  name: string;
  url: string;
  size: number | null;
  contentType: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ModelUsage = {
  url: string;
  projectId: string;
  projectTitle: string;
  projectSlug: string;
};

export type ProjectModelOption = {
  id: string;
  title: string;
  slug: string;
  modelUrl: string | null;
};

/**
 * The library seam. A model row is metadata; the projects that reference it do
 * so by URL, which is what makes replacement cheap and deletion safe to gate.
 */
export interface ModelStore {
  listModels(): Promise<ModelRecord[]>;
  listProjectModelOptions(): Promise<ProjectModelOption[]>;
  findModel(id: string): Promise<ModelRecord | null>;
  findModelByUrl(url: string): Promise<ModelRecord | null>;
  createModel(input: {
    name: string;
    url: string;
    size: number | null;
    contentType: string | null;
  }): Promise<ModelRecord>;
  updateModel(
    id: string,
    patch: { name?: string; url?: string; size?: number | null; contentType?: string | null },
  ): Promise<void>;
  deleteModel(id: string): Promise<void>;
  /** Every project that points at a stored model, newest first. */
  listModelUsage(): Promise<ModelUsage[]>;
  /** Rewrites every project reference from one url to another. */
  reassignModelUrl(oldUrl: string, newUrl: string): Promise<number>;
  /** Detaches a url from every project, leaving them on their cover image. */
  clearModelUrl(url: string): Promise<number>;
}

export function describeUsage(usage: ModelUsage[], url: string): ModelUsage[] {
  return usage.filter((entry) => entry.url === url);
}
