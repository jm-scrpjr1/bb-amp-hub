
"use client";

import PageTemplate from '@/components/common/page-template';
import { Settings } from '@/components/icons';

export default function SettingsPage() {
  return (
    <PageTemplate
      title="Settings"
      description="Manage your account preferences and application settings"
      icon={Settings}
    />
  );
}
