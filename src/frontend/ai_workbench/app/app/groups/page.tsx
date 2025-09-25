
"use client";

import PageTemplate from '@/components/common/page-template';
import { Users } from 'lucide-react';

export default function GroupsPage() {
  return (
    <PageTemplate
      title="Groups"
      description="Manage team groups and collaborate on projects together"
      icon={Users}
    />
  );
}
