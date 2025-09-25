
"use client";

import PageTemplate from '@/components/common/page-template';
import { Bot } from 'lucide-react';

export default function AIAgentsPage() {
  return (
    <PageTemplate
      title="AI Agents"
      description="Manage and deploy intelligent AI agents to automate your workflows"
      icon={Bot}
    />
  );
}
