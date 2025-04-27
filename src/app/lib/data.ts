/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import { PowerUp } from "@/src/types/power-up";

/**
 * Represents a local data storage.
 *
 * @class DataStorage
 * @description Data storage provides functionality to update local storage
 * data shared between windows of the same origin. Create an independent data
 * storage by instantiating this class, or use `getInstance` method to
 * retrieve a singleton instance.
 */
export class DataStorage {
  private data: PowerUp.WBSData = [];
  private dataKey: string;
  private window: Window;

  private static singleton: DataStorage;

  /**
   * Get the default local storage key for WBS data.
   * @param origin - A string representing the power-up origin URL.
   * @returns Local storage key.
   */
  public static getDefaultKey(origin: string): string {
    return 'trello_' + origin + '_local_data';
  }

  /**
   * Read the previous data stored in the local storage, if it exists and can
   * be parsed from JSON.
   *
   * @returns Data that was loaded and parsed.
   */
  public read(): PowerUp.WBSData {
    const dataStr = this.window.localStorage.getItem(this.dataKey);

    if (dataStr) {
      /* WBS data exists (might be new) in local storage.
       * Keep the data we had if we fail to parse it. */
      try {
        const newData: PowerUp.WBSData = JSON.parse(dataStr);
        if (Array.isArray(newData)) this.data = newData;
      } catch (error) {
        console.warn('DataStorage update skipped (' + this.dataKey + '): ' + error);
      }
    }

    return this.data;
  }

  /**
    * Updates data storage's data.
    * @param newData - New data for the data storage instance.
    * @returns The updated data.
    */
  public update(newData: PowerUp.WBSData): PowerUp.WBSData {
    this.data = newData;
    return this.data;
  }

  /**
   * Write new data into the local storage.
   *
   * @param boardId - The ID of the Trello Board to associate the data with.
   * @param listData - Data to write.
   * @returns The updated data.
   *
   * @throws {TypeError} When failed to stringify the provided data into JSON.
   * @throws {QuotaExceededError} When `localStorage.setItem()` was declined.
   */
  public write(boardId: string, listData: PowerUp.ListData[]): PowerUp.WBSData {
    const index = this.data.findIndex((value) => value.boardId === boardId);

    if (index === -1) {
      this.data.push({
        boardId: boardId,
        listData: listData,
      });
    } else {
      this.data[index].listData = listData;
    }

    this.window.localStorage.setItem(this.dataKey, JSON.stringify(this.data));

    return this.data;
  }

  /**
   * Creates a new data storage instance.
   *
   * @param window - Window object to access the local storage of.
   * @param origin - Page origin to construct the data key from.
   *
   * @see DataStorage#getDefaultKey for key construction.
   * @see DataStorage#getInstance to retrieve a singleton instance.
   */
  constructor(window: Window, origin: string) {
    this.dataKey = DataStorage.getDefaultKey(origin);
    this.window = window;
    this.read();
  }

  /**
   * Retrieves the data storage singleton instance and ensures it uses the
   * provided parameters.
   *
   * @param window - Window object to access the local storage of.
   * @param origin - Page origin to construct the data key from.
   *
   * @see DataStorage#getDefaultKey for key construction.
   */
  public static getInstance(window: Window, origin: string): DataStorage {
    if (!DataStorage.singleton) {
      DataStorage.singleton = new DataStorage(window, origin);

    } else {
      DataStorage.singleton.dataKey = DataStorage.getDefaultKey(origin);
      DataStorage.singleton.window = window;
      DataStorage.singleton.read();
    }

    return DataStorage.singleton;
  }

  /**
   * Adds a new storage event listener that calls the provided callback when a
   * new event occurs, if event's key and data are valid.
   *
   * @param callbackfn - The callback function to call on new event.
   */
  public onevent(callbackfn: (newData: PowerUp.WBSData) => void) {
    this.window.addEventListener('storage', (event) => {
      if (event.key !== this.dataKey) return;
      else if (!event.newValue) return;

      try {
        const newData: PowerUp.WBSData = JSON.parse(event.newValue);
        if (!Array.isArray(newData)) return;
        callbackfn(newData);
      } catch (error) {
        console.error('DataStorage event: ' + error);
      }
    });
  }
}