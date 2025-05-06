'use client';

import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratação incorreta
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="font-medium">Tema do sistema</Label>
        <p className="text-sm text-muted-foreground mb-4">Escolha como o tema será aplicado</p>
        <RadioGroup
          value={theme}
          onValueChange={setTheme}
          className="flex items-center space-x-2"
        >
          <div className="flex-1">
            <RadioGroupItem
              value="light"
              id="light"
              className="peer sr-only"
            />
            <Label
              htmlFor="light"
              className={cn(
                "flex items-center justify-center space-x-2 rounded-md border-2 p-3 cursor-pointer transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                theme === 'light' 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-muted bg-popover"
              )}
            >
              <Sun className="h-4 w-4" />
              <span className="text-sm font-medium">Claro</span>
            </Label>
          </div>

          <div className="flex-1">
            <RadioGroupItem
              value="dark"
              id="dark"
              className="peer sr-only"
            />
            <Label
              htmlFor="dark"
              className={cn(
                "flex items-center justify-center space-x-2 rounded-md border-2 p-3 cursor-pointer transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                theme === 'dark' 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-muted bg-popover"
              )}
            >
              <Moon className="h-4 w-4" />
              <span className="text-sm font-medium">Escuro</span>
            </Label>
          </div>

          <div className="flex-1">
            <RadioGroupItem
              value="system"
              id="system"
              className="peer sr-only"
            />
            <Label
              htmlFor="system"
              className={cn(
                "flex items-center justify-center space-x-2 rounded-md border-2 p-3 cursor-pointer transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                theme === 'system' 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-muted bg-popover"
              )}
            >
              <Monitor className="h-4 w-4" />
              <span className="text-sm font-medium">Sistema</span>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
} 