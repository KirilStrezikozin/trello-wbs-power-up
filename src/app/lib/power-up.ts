/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import { Trello } from '@/src/types/trello';
import { PowerUp } from '@/src/types/power-up';

import { LogoIcon, PowerUpName } from './constants';

/**
 * Trello power-up initialization state constants.
 */
export enum PowerUpState {
  Loading,
  Ready,
  NotInTrelloError,
  UnknownError,
}

/**
 * Assemble the data required to build a work breakdown structure chart.
 * @param lists - Trello Lists to get the data from.
 * @returns Assembled data.
 */
function makeData(lists: Trello.PowerUp.List[]): PowerUp.ListData[] {
  return lists.map(({ name, cards }) => ({
    name,
    cards: cards.map(({ name, dueComplete }) => ({
      name,
      isComplete: dueComplete,
    })),
  }));
}

export const CapabilityHandlers: PowerUp.CapabilityHandlers = {
  getDefault: function(origin: string) {
    /* Pressing on the power-up's board button will redirect the user
     * to our power-up root path. */
    const callbackUrl = origin;

    return {
      icon: {
        light: origin + LogoIcon.light,
        dark: origin + LogoIcon.dark,
      },
      text: PowerUpName,
      condition: 'always',
      url: callbackUrl,

      callback(t: Trello.PowerUp.IFrame) {
        t.lists('all').then((lists: Trello.PowerUp.List[]) => {
          const data = makeData(lists);
          console.log(data.length, JSON.stringify(data, null, 2));
        });

        return t.alert({
          message: 'WBS chart will open in a new browser tab',
          duration: 10,
        });
      },
    }
  }
}