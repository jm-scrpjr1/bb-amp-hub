
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockUser } from '@/lib/mock-data';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-700">{mockUser.greeting}</span>
        <Avatar className="h-8 w-8">
          <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
          <AvatarFallback className="bg-blue-600 text-white text-sm">
            {mockUser.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
