import React from 'react';
import { Languages, Check } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { useLanguage, languages, Language } from '../context/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'ghost', 
  className = '',
  showLabel = false
}) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          className={`h-10 px-3 rounded-xl gap-2 font-bold ${className}`}
          aria-label={t('lang_select')}
        >
          <Languages size={20} className="text-[#084328]" />
          {showLabel && <span className="hidden sm:inline">{languages[language as Language].name}</span>}
          {languages[language as Language].flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-slate-100 dark:border-slate-800 shadow-xl">
        <DropdownMenuLabel className="font-black text-xs uppercase text-slate-400 px-3 py-2">
          {t('lang_select')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
        {(Object.keys(languages) as Language[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer font-bold ${
              language === lang 
                ? 'bg-[#084328]/10 text-[#084328]' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <span>{languages[lang].flag}</span>
              <span>{languages[lang].name}</span>
            </div>
            {language === lang && <Check size={16} strokeWidth={3} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};