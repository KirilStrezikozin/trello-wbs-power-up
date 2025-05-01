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

import Intro from '../../components/intro';
import ThemeSwitch from '../../components/theme';

import { CapabilityHandlers, PowerUpState } from '../../lib/power-up';
import { PowerUpNameLong } from '../../lib/constants';

export default function Home() {
  const [powerUpState, setPowerUpState] = useState(PowerUpState.Loading);

  useEffect(() => {
    const origin = window.location.origin;

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
      console.error(origin + ': Unknown error');
      setPowerUpState(PowerUpState.UnknownError);
      return;
    }

    /* Initialize a Trello power-up. */
    window.TrelloPowerUp.initialize({
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      'board-buttons': function(_t: Trello.PowerUp.IFrame) {
        return [CapabilityHandlers.getDefault(origin)];
      },
    });

    setPowerUpState(PowerUpState.Ready);
  }, []);

  let title: string | undefined = undefined;
  let description: string | undefined = undefined;

  switch (powerUpState) {
    case PowerUpState.Loading:
      return (
        <>
        </>
      );
    /*
    title = 'Loading...'
    description = 'Trello Power-Up is loading.';
    break;
    */
    case PowerUpState.Ready:
      title = PowerUpNameLong;
      description = 'Trello Power-Up has been successfully loaded!';
      break;
    case PowerUpState.NotInTrelloError:
      title = 'XXX Error';
      description = "No one's on the line... Did you open this page from inside Trello?";
      break;
    default:
      title = 'XXX Error';
      description = "Failed to initialize the Power-Up. Did you open this page from inside Trello?";
      break;
  }

  return (
    <>
      <main className='flex flex-col gap-[32px] row-start-2 items-center sm:items-start'>
        <Intro
          title={title}
          description={description}
        />
      </main>
      <div className='fixed bottom-6 right-6'>
        <div className='flex flex-col gap-[8px]'>
          <ThemeSwitch />
        </div>
      </div>
    </>
  );
}