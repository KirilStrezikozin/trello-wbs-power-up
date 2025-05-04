/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

import * as React from 'react';

import * as Data from '../types/data';
import { DataStorage } from '../lib/data';

const AlreadyInitializedError = Error('Storage had been already initialized');
const UninitializedError = Error('Use of uninitialized storage');

const SSRWarning =
  'Use of storage detected on the server. ' +
  'It is only possible to use the storage on the client';

const SSRError = Error(SSRWarning);

type Value = {
  mounted: boolean,
  data: Data.Boards,
  instance?: DataStorage
};

type Action = (
  { type: 'init' }
  |
  { type: 'update', newData: Data.Boards }
);

const initialValue: Value = { mounted: false, data: [], instance: undefined };

const Context = React.createContext<Value>(initialValue);

const DispatchContext = React.createContext<(React.ActionDispatch<[action: Action]> | null)>(null);

/* <https://react.dev/learn/extracting-state-logic-into-a-reducer> */
function Reducer(value: Value, action: Action): Value {
  if (typeof window === 'undefined') {
    throw SSRError;
  }

  let data: Data.Boards | undefined = undefined;
  const instance = DataStorage.getInstance(window, window.location.origin);

  switch (action.type) {
    case 'init':
      if (value.mounted) {
        throw AlreadyInitializedError;
      }

      instance.onevent((newData: Data.Boards) => {
        if (typeof window === 'undefined') {
          console.warn(SSRWarning);
          return;
        }

        try {
          instance.writeAll(newData);
          console.log(newData);

        } catch (error) {
          if (error instanceof Error) {
            console.warn('Skipped data update: ' + error.message);
          }
        }
      })

      /* In case this page was loaded after the new data was written, the
       * event callback above will not fire. Read it once manually. */
      data = instance.read();

      return {
        mounted: true,
        data: data,
        instance: instance,
      };

    case 'update':
      if (!value.mounted) {
        throw UninitializedError;
      }

      /* React will skip a state update if value did not change too.
       * The check below is performed manually though to avoid calling
       * `update` redundantly on the storage instance. */
      if (Object.is(value.data, action.newData)) {
        return value;
      }

      data = instance.writeAll(action.newData);

      return {
        mounted: true,
        data: data,
        instance: instance,
      };

    default:
      throw Error('Unknown action: ' + action);
  }
}

export {
  AlreadyInitializedError,
  UninitializedError,
  SSRError,

  initialValue,
  Context,
  DispatchContext,
  Reducer,
};