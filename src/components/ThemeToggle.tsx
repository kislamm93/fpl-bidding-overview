import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme as 'light' | 'dark');
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="fixed top-4 right-4 p-3 rounded-lg bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-700 z-50"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-6 h-6 text-slate-700" />
      ) : (
        <Sun className="w-6 h-6 text-yellow-500" />
      )}
    </button>
  );
};

export default ThemeToggle; 