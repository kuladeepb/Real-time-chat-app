import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full hover:bg-[#efefef] dark:hover:bg-[#1a1a1a] text-[#262626] dark:text-[#f5f5f5] transition-colors focus:outline-none"
      aria-label="Toggle theme"
    >
      {isDark
        ? <Sun className="h-5 w-5 text-amber-400" />
        : <Moon className="h-5 w-5 text-indigo-500" />
      }
    </button>
  );
};

export default ThemeToggle;
