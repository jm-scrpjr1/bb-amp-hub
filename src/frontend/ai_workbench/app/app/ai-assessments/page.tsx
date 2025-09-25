
"use client";

import PageTemplate from '@/components/common/page-template';
import { ClipboardList } from 'lucide-react';

export default function AIAssessmentsPage() {
  return (
    <PageTemplate
      title="AI Assessments"
      description="Evaluate and assess AI model performance and capabilities"
      icon={ClipboardList}
    />
  );
}
