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
import { PowerUpState } from '../lib/trello/power-up';

export default function Home() {
  const [powerUpState, setPowerUpState] = useState(PowerUpState.Loading);

  useEffect(() => {
    /* Determine if we can load a Trello power-up and set the corresponding
     * state value. We will re-render page contents when this value changes.
     */
    if (typeof window === 'undefined') {
      setPowerUpState(PowerUpState.UnknownError);
      return;
    }

    else if (typeof window.parent !== 'undefined' && window.parent === window) {
      setPowerUpState(PowerUpState.NotInTrelloError);
      return;
    }

    else if (typeof window.TrelloPowerUp === 'undefined') {
      setPowerUpState(PowerUpState.UnknownError);
      return;
    }

    /* Initialize a Trello power-up. */
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

    setPowerUpState(PowerUpState.Ready);
  }, []);


  switch (powerUpState) {
    case PowerUpState.Loading:
      return (
        <main>
          <h1>Loading...</h1>
        </main>
      );
    case PowerUpState.Ready:
      return (
        <main>
          <h1>Hello from Trello Power Up!</h1>
        </main>
      );
    case PowerUpState.NotInTrelloError:
      return (
        <main>
          <h1>You must open this page from inside Trello!</h1>
        </main>
      );
    default:
      return (
        <main>
          <h1>Cannot initialize Trello Power Up!</h1>
          <h1>You must open this page from inside Trello!</h1>
        </main>
      );
  }

}