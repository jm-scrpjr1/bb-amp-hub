
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import GSAPProvider from '@/components/animations/GSAPProvider';
import LiquidCursor from '@/components/effects/liquid-cursor';
import AuthProvider from '@/providers/auth-provider';
import { RBACProvider } from '@/providers/rbac-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Workbench™ - Select Your Tools. Start Your Work. Ask for Help. Get Amplified Results.',
  description: 'Imagine a world where your talent walks into their desktop, selects and uses AI tools, gets help from a productivity engineer... and achieves amplified results.',
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
          <RBACProvider>
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
          </RBACProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
