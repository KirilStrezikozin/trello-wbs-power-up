/**
 * Copyright (c) 2021 Optro
 *
 * SPDX-License-Identifier: MIT
 *
 * This file does not modify the original content, which is available at
 * https://github.com/optro-cloud/trello-powerup-full-sample and licensed under
 * the MIT license.
 */

import { Trello } from "./trello";

export interface Note {
  color: string;
  text: string;
}

export interface NoteWithCard extends Note {
  card: Trello.PowerUp.Card;
}

export interface CardWithNotes extends Trello.PowerUp.Card {
  notes?: Note[];
}

export interface CapabilityProps {
  baseUrl: string;
  icon: {
    light: string;
    dark: string;
  }
}