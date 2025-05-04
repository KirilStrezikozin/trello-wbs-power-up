/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import * as Data from '@/src/types/data';

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
  private data: Data.Boards = [];
  private dataKey: string;
  private window: Window;

  private callbacks: ((newData: Data.Boards) => void)[] = [];

  private static singleton: DataStorage;

  /**
   * Verifies an object with boards data against its validation schema.
   *
   * @param data - Object to verify.
   * @returns - Verified boards data on success.
   *
   * @throws {TypeError} When validation failed.
   */
  public static verifiedData(data: Data.Boards): Data.Boards {
    const verif = Data.BoardsSchema.safeParse(data);
    if (!verif.success) {
      throw TypeError('Argument does not satisfy validation schema');
    }

    /* Return clean data value instead of the given argument
     * in case schema strips out unrecognized keys. */
    return verif.data;
  }

  /**
   * Get the default local storage key for WBS data.
   * @param origin - A string representing the power-up origin URL.
   * @returns Local storage key.
   */
  public static getDefaultKey(origin: string): string {
    return 'trello_' + origin + '_local_data';
  }

  /**
   * Get the data key of the storage.
   * @returns Data key.
   */
  public get key(): string {
    return this.dataKey;
  }

  /**
   * Read the previous data stored in the local storage,
   * if it exists and is valid.
   *
   * @returns Data that was loaded and parsed.
   */
  public read(): Data.Boards {
    const dataStr = this.window.localStorage.getItem(this.dataKey);

    if (dataStr) {
      /* WBS data exists (might be new) in local storage.
       * Keep the data we had if we fail to parse it. */
      try {
        const newData: Data.Boards = JSON.parse(dataStr);
        this.data = DataStorage.verifiedData(newData);

      } catch (error) {
        console.warn('DataStorage update skipped (' + this.dataKey + '): ' + error);
      }
    }

    return this.data;
  }

  /**
   * Write new full Trello boards data into the local storage and
   * update storage's data.
   *
   * @param newData - Boards data to write.
   * @returns The updated data.
   *
   * @throws {TypeError} When validation failed.
   * @throws {QuotaExceededError} When `localStorage.setItem()` was declined.
   */
  public writeAll(data: Data.Boards): Data.Boards {
    const verif = Data.BoardsSchema.safeParse(data);
    if (!verif.success) {
      throw TypeError('Argument does not satisfy validation schema');
    }

    /* Try to write to the local storage first.
     * If it fails, storage instance's data is left unmodified. */
    this.window.localStorage.setItem(this.dataKey, JSON.stringify(verif.data));

    /* Use clean data value in case schema strips out unrecognized keys. */
    this.data = verif.data;
    return this.data;
  }

  /**
   * Write new Trello Board data into the local storage and
   * update storage's data.
   *
   * @param board - Board data to write.
   * @returns The updated data.
   *
   * @throws {TypeError} When board data validation failed.
   * @throws {QuotaExceededError} When `localStorage.setItem()` was declined.
   */
  public write(board: Data.Board): Data.Boards {
    const verif = Data.BoardSchema.safeParse(board);
    if (!verif.success) {
      throw TypeError('Argument does not satisfy validation schema');
    }

    /* Use clean board value in case schema strips out unrecognized keys. */
    board = verif.data;

    /* Modify instance's data at the end,
     * if write to the local storage succeeds. */
    const data = [...this.data];
    const index = data.findIndex((value) => value.id === board.id);

    if (index === -1) {
      data.push(board);
    } else {
      data[index].lists = board.lists;
    }

    this.window.localStorage.setItem(this.dataKey, JSON.stringify(data));

    this.data = data;
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
  public onevent(callbackfn: ((newData: Data.Boards) => void)) {
    this.callbacks.push(callbackfn);

    this.window.addEventListener('storage', (event) => {
      if (event.key !== this.dataKey) return;
      else if (!event.newValue) return;

      try {
        const newData: Data.Boards = JSON.parse(event.newValue);
        callbackfn(DataStorage.verifiedData(newData));

      } catch (error) {
        console.error('DataStorage event: ' + error);
      }
    });
  }

  /**
   * Calls all storage event callbacks registered with `onevent` with the
   * data currently stored in the instance. Call `read` beforehand to ensure
   * the most up-to-date data.
   */
  public notifyAll() {
    this.callbacks.map((callbackfn) => callbackfn(this.data));
  }
}