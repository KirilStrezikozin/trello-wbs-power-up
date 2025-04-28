/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

namespace Data {

  /**
   * List represents the data required to create a
   * work breakdown structure chart from a single Trello List.
   */
  export type List = {
    /** Name of the Trello List. */
    name: string,
    /** Array of card information. */
    cards: {
      /** Name of the Trello Card. */
      name: string,
      /** Whether the Trello Card has been completed. */
      isComplete: boolean,
    }[],
  }

  /**
   * Board represents the data required to create a
   * work breakdown structure chart from a Trello Board.
   */
  export type Board = {
    /** ID of the Trello Board. */
    id: string,
    /** Name of the Trello Board. */
    name: string,
    /** List data. */
    lists: List[],
  }

  export type Boards = Board[];

}