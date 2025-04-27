/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { Trello } from '@/src/types/trello';
import { useEffect, useState } from 'react';

import { LogoIcon, PowerUpName } from '../lib/constants';
export default function Home() {
  const [trelloInitialized, setTrelloInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    else if (typeof window.parent !== 'undefined' && window.parent === window) return;
    else if (typeof window.TrelloPowerUp === 'undefined') return;

    const originUrl = window.location.origin;
    const callbackUrl = originUrl;

    window.TrelloPowerUp.initialize({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      'board-buttons': function(_t: Trello.PowerUp.IFrame) {
        return [{
          icon: {
            light: originUrl + LogoIcon.light,
            dark: originUrl + LogoIcon.dark,
          },
          text: PowerUpName,
          condition: 'always',
          url: callbackUrl,
        }];
      },
    });

    setTrelloInitialized(true);
  }, []);

  if (!trelloInitialized) {
    return (
      <main>
        <h1>Cannot initialize Trello</h1>
      </main>
    );
  }

  return (
    <main>
      <h1>Trello Power Up</h1>
    </main>
  );
