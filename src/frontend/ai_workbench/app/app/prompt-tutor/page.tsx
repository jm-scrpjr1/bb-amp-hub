
"use client";

import PageTemplate from '@/components/common/page-template';
import { BookOpen } from 'lucide-react';

export default function PromptTutorPage() {
  return (
    <PageTemplate
      title="Prompt Tutor"
      description="Learn to create effective AI prompts with guided tutorials and best practices"
      icon={BookOpen}
    />
  );
}
