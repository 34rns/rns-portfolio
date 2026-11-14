import { requireAdmin } from "@/lib/auth/require-admin";
import { PortfolioDashboard } from "../page";
export default async function Page(){await requireAdmin();return <PortfolioDashboard/>;}
