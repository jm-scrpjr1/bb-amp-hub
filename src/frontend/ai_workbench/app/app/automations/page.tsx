
"use client";

import PageTemplate from '@/components/common/page-template';
// Temporary: Using custom icon until lucide-react is installed
// import { Zap } from 'lucide-react';
import { Zap } from '@/components/icons';

export default function AutomationsPage() {
  return (
    <PageTemplate
      title="Automations"
      description="Create and manage automated workflows to streamline your processes"
      icon={Zap}
    />
  );
}
