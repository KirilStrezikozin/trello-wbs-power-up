/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import { z } from 'zod';

export const ListSchema = z.object({
  name: z.string().min(1),
  cards: z.object({
    name: z.string().min(1),
    isComplete: z.boolean(),
  }).strict().array(),
}).strict();

/**
 * List represents the data required to create a
 * work breakdown structure chart from a single Trello List.
 */
export type List = z.infer<typeof ListSchema>;

export const BoardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lists: ListSchema.array(),
}).strict();

/**
 * Board represents the data required to create a
 * work breakdown structure chart from a Trello Board.
 */
export type Board = z.infer<typeof BoardSchema>;

export const BoardsSchema = BoardSchema.array();
export type Boards = z.infer<typeof BoardsSchema>;