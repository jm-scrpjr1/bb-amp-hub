
"use client";

import PageTemplate from '@/components/common/page-template';
// Temporary: Using custom icon until lucide-react is installed
// import { Activity as ActivityIcon } from 'lucide-react';
import { Activity as ActivityIcon } from '@/components/icons';

export default function ActivityPage() {
  return (
    <PageTemplate
      title="Activity"
      description="View detailed activity logs and track team interactions"
      icon={ActivityIcon}
    />
  );
}
