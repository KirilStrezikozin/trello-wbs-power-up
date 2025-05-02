/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { useCallback, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from './ui/button';

export default function ThemeSwitch() {
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    document.documentElement.classList[theme === 'dark' ? 'add' : 'remove']('dark');

    try {
      window.localStorage.setItem('theme', theme);
    } catch { }
  }, []);

  const initTheme = useCallback(() => {
    let preferredTheme: string | null = null;

    try {
      preferredTheme = window.localStorage.getItem('theme');
    } catch { }

    if (preferredTheme === 'light' || preferredTheme === 'dark') {
      setTheme(preferredTheme);
      return;
    }

    const watchSystemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    watchSystemTheme.addEventListener('change', (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    });

  }, [setTheme]);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <Button
        aria-label='Use dark theme'
        variant='outline'
        className='flex dark:hidden'
        onClick={() => setTheme('dark')}
      >
        <Sun className='h-[1.2rem] w-[1.2rem] transition-all' />
      </Button>
      <Button
        aria-label='Use light theme'
        variant='outline'
        className='hidden dark:flex'
        onClick={() => setTheme('light')}
      >
        <Moon className='h-[1.2rem] w-[1.2rem] transition-all' />
      </Button>
    </>
  );
}