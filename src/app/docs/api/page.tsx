import { integrationDoc } from "@/lib/licensing/integration-doc";
import Markdown from "react-markdown";
export default function Page(){return <main style={{maxWidth:850,margin:"60px auto",padding:"0 24px",fontFamily:"system-ui",lineHeight:1.8}}><Markdown>{integrationDoc}</Markdown><a href="/openapi.json">OpenAPI schema →</a></main>;}
