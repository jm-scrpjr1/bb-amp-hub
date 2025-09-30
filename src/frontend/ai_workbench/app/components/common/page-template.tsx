
"use client";

import { memo } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { ScrollEffects, TextScramble } from '@/components/effects';
// Temporary: Using custom icon type until lucide-react is installed
// import { LucideIcon } from 'lucide-react';
type LucideIcon = React.ComponentType<{ className?: string; size?: number }>;

// Client component for Subscribe button
function SubscribeButton() {
  const handleClick = () => {
    console.log('Subscribe to updates clicked');
    // Add subscription logic here
  };

  return (
    <span
      onClick={handleClick}
      className="text-blue-600 font-medium ml-1 cursor-pointer hover:text-blue-800"
    >
      Subscribe to updates
    </span>
  );
}

interface PageTemplateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children?: React.ReactNode;
}

const PageTemplate = memo(function PageTemplate({ title, description, icon: Icon, children }: PageTemplateProps) {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <ScrollEffects effect="fadeUp" delay={0.1}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 transform translate-x-32 -translate-y-32"></div>

            <div className="relative z-10">
              <ScrollEffects effect="fadeUp" delay={0.4}>
                <h1 className="text-2xl md:text-3xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  <TextScramble
                    text={title}
                    trigger={true}
                    speed={50}
                    delay={400}
                  />
                </h1>
              </ScrollEffects>

              <ScrollEffects effect="fadeUp" delay={0.6}>
                <p className="text-xl text-blue-100 mb-6 max-w-3xl">
                  {description}
                </p>
              </ScrollEffects>

              <ScrollEffects effect="fadeUp" delay={0.8}>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold">AI-Amplified™</span>
                  </div>
                </div>
              </ScrollEffects>
            </div>
          </div>
        </ScrollEffects>

        {/* Coming Soon Section */}
        {!children && (
          <ScrollEffects effect="fadeUp" delay={1.0}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
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
                    <SubscribeButton />
                  </p>
                </div>
              </div>
            </div>
          </ScrollEffects>
        )}

        {/* Custom Content */}
        {children && (
          <ScrollEffects effect="fadeUp" delay={1.0}>
            <div>
              {children}
            </div>
          </ScrollEffects>
        )}
      </div>
    </MainLayout>
  );
});

export default PageTemplate;
