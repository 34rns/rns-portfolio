import type {
  NewOrder,
  OrderPatch,
  OrderProject,
  OrderRecord,
  OrderRow,
  OrderStore,
} from "@/lib/orders/store";

export function seedOrderProject(overrides: Partial<OrderProject> = {}): OrderProject {
  return {
    id: "project_1",
    slug: "paid-project",
    title: "Paid Project",
    status: "published",
    isPaid: true,
    priceCents: 4900,
    currency: "USD",
    downloadUrl: "https://example.com/app.zip",
    ...overrides,
  };
}

export function createMemoryOrderStore({
  projects = [seedOrderProject()],
}: { projects?: OrderProject[] } = {}) {
  const orders = new Map<string, OrderRecord>();
  let counter = 0;

  const store: OrderStore = {
    async getProjectBySlug(slug) {
      return projects.find((project) => project.slug === slug) ?? null;
    },
    async getProjectById(id) {
      return projects.find((project) => project.id === id) ?? null;
    },
    async createOrder(input: NewOrder) {
      counter += 1;
      const now = new Date();
      const order: OrderRecord = {
        id: `order_${counter}`,
        ...input,
        status: "requested",
        notes: null,
        createdAt: now,
        updatedAt: now,
      };
      orders.set(order.id, order);
      return order;
    },
    async findOrderByTokenHash(hash) {
      return [...orders.values()].find((order) => order.tokenHash === hash) ?? null;
    },
    async findOrderById(id) {
      return orders.get(id) ?? null;
    },
    async updateOrder(id, patch: OrderPatch) {
      const order = orders.get(id);
      if (!order) return;
      orders.set(id, { ...order, ...patch, updatedAt: new Date() });
    },
    async listOrders({ status, query, page = 0, perPage = 50 }) {
      const rows = [...orders.values()]
        .filter((order) => (status ? order.status === status : true))
        .filter((order) => {
          if (!query) return true;
          const needle = query.toLowerCase();
          const project = projects.find((entry) => entry.id === order.projectId);
          return (
            order.name.toLowerCase().includes(needle) ||
            order.email.toLowerCase().includes(needle) ||
            (project?.title.toLowerCase().includes(needle) ?? false)
          );
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(page * perPage, page * perPage + perPage);

      return rows.map((order): OrderRow => {
        const project = projects.find((entry) => entry.id === order.projectId);
        return {
          ...order,
          projectTitle: project?.title ?? "Unknown",
          projectSlug: project?.slug ?? "",
        };
      });
    },
    async countOrders({ status, query } = {}) {
      const rows = await this.listOrders({ status, query, perPage: 1000 });
      return rows.length;
    },
  };

  return { store, orders };
}
