
"use client";

import PageTemplate from '@/components/common/page-template';
// Temporary: Using custom icon until lucide-react is installed
// import { GraduationCap } from 'lucide-react';
import { GraduationCap } from '@/components/icons';

export default function TrainingsPage() {
  return (
    <PageTemplate
      title="Trainings"
      description="Access learning materials and track your training progress"
      icon={GraduationCap}
    />
  );
}
