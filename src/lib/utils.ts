/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export enum Theme {
  System = 'system',
  Dark = 'dark',
  Light = 'light',
}

export function nextTheme(theme: string | undefined): string {
  switch (theme) {
    case Theme.System:
      return Theme.Dark;
    case Theme.Dark:
      return Theme.Light;
    case Theme.Light:
      return Theme.System;
    default:
      return Theme.System;
  }
}