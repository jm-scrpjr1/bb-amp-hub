
"use client";

import PageTemplate from '@/components/common/page-template';
import { Zap } from 'lucide-react';

export default function AutomationsPage() {
  return (
    <PageTemplate
      title="Automations"
      description="Create and manage automated workflows to streamline your processes"
      icon={Zap}
    />
  );
}
