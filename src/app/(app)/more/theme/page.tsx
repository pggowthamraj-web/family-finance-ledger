'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/Card';
import { Sun, Moon, Laptop } from 'lucide-react';

type ThemeChoice = 'light' | 'dark' | 'system';

export default function ThemePage() {
  const [theme, setTheme] = useState<ThemeChoice>('system');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as ThemeChoice) ?? 'system';
    // Syncing state from localStorage (an external system) on mount, not derived from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored);
  }, []);

  function apply(choice: ThemeChoice) {
    setTheme(choice);
    localStorage.setItem('theme', choice);
    const root = document.documentElement;
    if (choice === 'system') {
      root.classList.remove('dark');
    } else {
      root.classList.toggle('dark', choice === 'dark');
    }
  }

  const OPTIONS: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div>
      <PageHeader title="Theme" backHref="/more" />
      <Card>
        <div className="space-y-2">
          {OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => apply(value)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                theme === value ? 'bg-teal-900 text-white' : 'bg-teal-900/[0.06] text-teal-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
