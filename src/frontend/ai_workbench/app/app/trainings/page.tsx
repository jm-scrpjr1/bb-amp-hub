
"use client";

import PageTemplate from '@/components/common/page-template';
import { GraduationCap } from 'lucide-react';

export default function TrainingsPage() {
  return (
    <PageTemplate
      title="Trainings"
      description="Access learning materials and track your training progress"
      icon={GraduationCap}
    />
  );
}
