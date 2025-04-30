/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import { Trello } from "./trello";

namespace PowerUp {

  export interface CapabilityHandlers {
    /**
     * Construct the default handler for a capability.
     * @param origin - A string representing the power-up origin URL.
     * @returns Trello board-button capability handler.
     */
    getDefault: (origin: string) => Trello.PowerUp.BoardButtonCallback;
  }

  /**
   * Represents the data from a single Trello List required to build a work
   * breakdown structure chart.
   */
  export interface ListData {
    /**
     * Name of the Trello List.
     */
    name: string,

    /**
     * Array of card information.
     */
    cards: {
      /**
       * Name of the Trello Card.
       */
      name: string,

      /**
       * Whether the Trello Card has been completed.
       */
      isComplete: boolean,
    }[],
  }

}