
"use client";

import PageTemplate from '@/components/common/page-template';
import { FileText } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <PageTemplate
      title="Resources"
      description="Access documentation, guides, and helpful resources"
      icon={FileText}
    />
  );
}
