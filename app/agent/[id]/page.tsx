// app/agent/[id]/page.tsx
import { redirect } from 'next/navigation';

interface AgentEditorRedirectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AgentEditorRedirectPage({ params }: AgentEditorRedirectPageProps) {
  const { id } = await params;
  const agentId = encodeURIComponent(id);
  redirect(`/agent/editor?id=${agentId}`);
}