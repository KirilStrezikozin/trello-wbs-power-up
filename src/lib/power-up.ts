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
import { DataStorage } from './data';

import * as Data from '../types/data';

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
 * Assemble the data for a work breakdown structure chart from Trello Lists.
 * @param lists - Trello Lists to get the data from.
 * @returns Assembled data.
 */
function makeListData(lists: Trello.PowerUp.List[]): Data.List[] {
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
        t.board('id', 'name').then(({ id, name }) => {

          t.lists('all').then((lists: Trello.PowerUp.List[]) => {
            const storage = DataStorage.getInstance(window, origin);

            /* Assemble new data for the work breakdown structure chart
             * and try to write it to the local storage. Currently opened
             * chart pages, if any, will get notified that we have updated
             * the data. */
            const listData = makeListData(lists);

            try {
              storage.write({ id: id, name: name, lists: listData });
            } catch (error) {
              console.error(origin + ': ' + error);
              return;
            }
          });
        });

        return t.alert({
          message: 'WBS chart will open in a new browser tab',
          duration: 10,
        });
      },
    }
  }
}