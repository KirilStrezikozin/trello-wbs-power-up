/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

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
    }
  }
}