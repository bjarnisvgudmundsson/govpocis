
'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  FileText,
  FolderOpen,
  CheckSquare,
  Briefcase,
  Files,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { getStoredCredentials, clearCredentials } from '@/lib/api-client';
import type { CredentialInfo } from '@/types';

const navigationItems = [
  {
    name: 'MÆLABORÐ',
    href: '/dashboard',
    icon: BarChart3,
    badge: null,
    color: 'text-muted-foreground',
    bgColor: 'hover:bg-accent'
  },
  {
    name: 'SAMÞYKKTIR',
    href: '/approvals',
    icon: CheckSquare,
    badge: 15, 
    color: 'text-muted-foreground',
    bgColor: 'hover:bg-accent'
  },
  {
    name: 'VERK',
    href: '/tasks',
    icon: Briefcase,
    badge: 34, 
    color: 'text-muted-foreground',
    bgColor: 'hover:bg-accent'
  },
  {
    name: 'MÁLASKRÁ',
    href: '/mycases',
    icon: FolderOpen,
    badge: 7, // Updated count
    color: 'text-muted-foreground',
    bgColor: 'hover:bg-accent'
  },
  {
    name: 'SAMNINGAR',
    href: '/contracts',
    icon: FileText,
    badge: 10, 
    color: 'text-muted-foreground',
    bgColor: 'hover:bg-accent'
  },
  {
    name: 'SKJÖL',
    href: '/documents',
    icon: Files,
    badge: 12, 
    color: 'text-muted-foreground',
    bgColor: 'hover:bg-accent'
  },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/') return null; 

  const handleLogout = () => {
    clearCredentials();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-primary border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <span className="text-lg font-bold font-headline text-primary-foreground">
                FANGELSISMÁLASTOFNUN
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      'relative px-3 py-2 transition-colors h-auto',
                      isActive ? 'bg-primary-foreground text-primary font-medium' : 'hover:bg-primary-foreground/10',
                      'text-sm'
                    )}
                    onClick={() => router.push(item.href)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <IconComponent className={cn('w-4 h-4 mr-2', isActive ? 'text-primary' : 'text-primary-foreground/80')} />
                    <span className={cn(
                      isActive ? 'text-primary' : 'text-primary-foreground/80 hover:text-primary-foreground'
                    )}>
                      {item.name}
                    </span>
                    {item.badge !== null && item.badge > 0 && (
                      <span className={cn(
                        "ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold leading-none rounded-full",
                        isActive ? "bg-primary text-primary-foreground" : "bg-primary-foreground text-primary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Útskrá
          </Button>
        </div>
      </div>
    </nav>
  );
}
