/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { Trello } from '@/src/types/trello';
import { useEffect } from 'react';
import { LogoIcon } from '../lib/constants';

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.TrelloPowerUp) {
      const originUrl = window.location.origin;
      const callbackUrl = originUrl;

      window.TrelloPowerUp.initialize({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        'board-buttons': function(_t: Trello.PowerUp.IFrame) {
          return [
            {
              icon: {
                light: originUrl + LogoIcon.light,
                dark: originUrl + LogoIcon.dark,
              },
              text: 'Hello',
              condition: 'always',
              callback: async function(tc: Trello.PowerUp.IFrame) {
                return tc.lists('all').then((lists) => {
                  console.log(JSON.stringify(lists, null, 2));
                })

                // tc.board().then(
                //   (data) => {
                //     console.log('HEY!!!', data.labels);
                //   },
                //   (error) => {
                //     console.log('OOOHHH NOOOOO', error);
                //   }
                // )
                //
                // return tc.alert({
                //   message: 'Pressed!',
                //   display: 'info',
                //   duration: 5
                // });
              }
            },
            {
              icon: {
                light: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
                dark: 'https://cdn.glitch.com/1b42d7fe-bda8-4af8-a6c8-eff0cea9e08a%2Frocket-ship.png?1494946700421',
              },
              text: 'WBS',
              condition: 'always',
              url: callbackUrl,
            }
          ];
        },
      });

    }
  }, []);

  return (
    <main>
      <h1>Trello Power Up</h1>
    </main>
  );
}