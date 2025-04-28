/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { useEffect, useState } from 'react';

import { DataStorage } from './lib/data';

export default function Home() {
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    const storage = DataStorage.getInstance(window, window.location.origin);

    storage.onevent((newData) => {
      storage.update(newData);
      setStorageReady(true);

      console.log(newData);
    })

    /* In case this page was loaded after the new data was written, the
     * event callback above will not fire. Check if we have data. */
    const newData = storage.read();
    if (newData.length) {
      setStorageReady(true);

      console.log(newData);
    }

  }, []);

  if (storageReady) {
    return (
      <main>
        <h1>I could be a chart.</h1>
      </main>
    );
  } else {
    return (
      <main>
        <h1>I cannot be a chart.</h1>
      </main>
    );
  }
}