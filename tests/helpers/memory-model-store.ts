import type {
  ModelRecord,
  ModelStore,
  ModelUsage,
  ProjectModelOption,
} from "@/lib/models/store";

export function createMemoryModelStore({
  projects = [
    { id: "project_1", title: "Paid Project", slug: "paid-project", modelUrl: null },
  ],
  models = [],
}: {
  projects?: ProjectModelOption[];
  models?: ModelRecord[];
} = {}) {
  const modelRows = new Map(models.map((model) => [model.id, model]));
  const projectRows = new Map(projects.map((project) => [project.id, project]));
  let counter = models.length;

  const store: ModelStore = {
    async listModels() {
      return [...modelRows.values()];
    },
    async listProjectModelOptions() {
      return [...projectRows.values()];
    },
    async findModel(id) {
      return modelRows.get(id) ?? null;
    },
    async findModelByUrl(url) {
      return [...modelRows.values()].find((model) => model.url === url) ?? null;
    },
    async createModel(input) {
      counter += 1;
      const now = new Date();
      const model: ModelRecord = {
        id: `model_${counter}`,
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      modelRows.set(model.id, model);
      return model;
    },
    async updateModel(id, patch) {
      const model = modelRows.get(id);
      if (!model) return;
      modelRows.set(id, { ...model, ...patch, updatedAt: new Date() });
    },
    async deleteModel(id) {
      modelRows.delete(id);
    },
    async listModelUsage(): Promise<ModelUsage[]> {
      return [...projectRows.values()]
        .filter((project) => project.modelUrl)
        .map((project) => ({
          url: project.modelUrl as string,
          projectId: project.id,
          projectTitle: project.title,
          projectSlug: project.slug,
        }));
    },
    async reassignModelUrl(oldUrl, newUrl) {
      let count = 0;
      for (const [id, project] of projectRows) {
        if (project.modelUrl !== oldUrl) continue;
        projectRows.set(id, { ...project, modelUrl: newUrl });
        count += 1;
      }
      return count;
    },
    async clearModelUrl(url) {
      let count = 0;
      for (const [id, project] of projectRows) {
        if (project.modelUrl !== url) continue;
        projectRows.set(id, { ...project, modelUrl: null });
        count += 1;
      }
      return count;
    },
  };

  return { store, models: modelRows, projects: projectRows };
}
