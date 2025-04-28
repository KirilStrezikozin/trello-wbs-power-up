/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, SunMoonIcon } from 'lucide-react';

import { Button } from './ui/button';
import { nextTheme, Theme } from '../lib/utils';
import { useEffect, useState } from 'react';

function ThemeIcon({ theme }: { theme: string | undefined }) {
  switch (theme) {
    case Theme.Light:
      return <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />;
    case Theme.Dark:
      return <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />;
    case Theme.System:
    default:
      return <SunMoonIcon className="h-[1.2rem] w-[1.2rem] transition-all" />;
  }
}

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  /* Render the theme switch when the page is mounted on the client.
   * See <https://github.com/pacocoursey/next-themes> */
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (<></>);
  }

  return (
    <Button
      variant='outline'
      onClick={() => setTheme(nextTheme(theme))}
    >
      <ThemeIcon theme={theme} />
    </Button>
  );
}