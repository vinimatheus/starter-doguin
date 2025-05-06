'use client'

import { ThemeSwitcher } from '@/components/theme-switcher'
export default function PreferencesPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Preferências</h2>
      <p className="mb-4 text-muted-foreground">
        Personalize as configurações da sua conta
      </p>
      
      <div className="space-y-6">
        
        <div className="border p-4 rounded-md">
          <h3 className="font-medium mb-4">Aparência</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 