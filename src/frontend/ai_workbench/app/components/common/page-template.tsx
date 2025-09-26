
"use client";

import { memo } from 'react';
import MainLayout from '@/components/layout/main-layout';
import PageTransition from '@/components/layout/page-transition';
// Temporary: Using custom icon type until lucide-react is installed
// import { LucideIcon } from 'lucide-react';
type LucideIcon = React.ComponentType<{ className?: string; size?: number }>;

interface PageTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

const PageTemplate = memo(function PageTemplate({ title, description, icon: Icon, children }: PageTemplateProps) {
  return (
    <MainLayout>
      <PageTransition>
        <div className="max-w-5xl mx-auto page-transition">
          {/* Page Header */}
          <div className="mb-8 page-element">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-1">{description}</p>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          {!children && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center page-element">
              <div className="max-w-md mx-auto">
                <div className="p-6 bg-blue-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Icon className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
                <p className="text-gray-600 leading-relaxed">
                  We're working hard to bring you amazing {title.toLowerCase()} features.
                  This section will be available soon with powerful tools to enhance your workflow.
                </p>
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Want to be notified when this feature is ready?
                    <span className="text-blue-600 font-medium ml-1 cursor-pointer hover:text-blue-800">
                      Subscribe to updates
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Content */}
          <div className="page-element">
            {children}
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
});

export default PageTemplate;
