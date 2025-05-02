/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { useEffect, useReducer } from 'react';

import { Chart } from '../components/chart';
import { DataTool } from '../components/tool';
import ThemeSwitch from '../components/theme';
import Footer from '../components/footer';
import Intro from '../components/intro';

import { PowerUpDescription, PowerUpNameLong } from '../lib/constants';

import * as StorageProvider from '../providers/storage';

export default function Home() {
  const [storage, dispatchStorage] = useReducer(
    StorageProvider.Reducer,
    StorageProvider.initialValue
  );

  useEffect(() => {
    /* Initialize the storage once the component is mounted on the client,
     * because it requires access to the window object. */
    dispatchStorage({
      type: 'init'
    });
  }, []);

  return (
    <StorageProvider.Context.Provider value={storage}>
      <StorageProvider.DispatchContext.Provider value={dispatchStorage}>
        <main className='flex flex-col gap-[64px] sm:gap-[32px] row-start-2 items-center justify-center sm:justify-start sm:items-start'>
          <Intro
            title={PowerUpNameLong}
            description={PowerUpDescription + '.'}
          />
          <Chart />
        </main>
        <Footer />
        <div className='fixed bottom-6 right-6'>
          <div className='flex flex-col gap-[8px]'>
            <DataTool />
            <ThemeSwitch />
          </div>
        </div>
      </StorageProvider.DispatchContext.Provider>
    </StorageProvider.Context.Provider>
  );
}