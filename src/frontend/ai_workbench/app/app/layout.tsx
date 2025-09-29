
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import GSAPProvider from '@/components/animations/GSAPProvider';
import LiquidCursor from '@/components/effects/liquid-cursor';
import AuthProvider from '@/providers/auth-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Workbench™ - Your AI-Powered Workspace',
  description: 'Manage projects, track progress, and collaborate with your team using AI assistance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <GSAPProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange={false}
            >
              <LiquidCursor
                color="#06E5EC"
                size={24}
                intensity="medium"
              />
              {children}
              <Toaster />
            </ThemeProvider>
          </GSAPProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
