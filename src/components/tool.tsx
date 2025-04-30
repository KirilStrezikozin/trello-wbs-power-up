/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { FileCog } from 'lucide-react';
import { useContext, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

import { Label } from './ui/label'
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

import { cn } from '../lib/utils';

import * as StorageProvider from '../providers/storage';
import { DataStorage } from '../lib/data';

export function DataTool() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('');

  const storage = useContext(StorageProvider.Context);
  const dispatchStorage = useContext(StorageProvider.DispatchContext);

  /* Render the data tool on the client once local storage is mounted. */
  if (!storage.mounted /* || !IsDevelopment() */) {
    return (
      <>
      </>
    );
  }

  const initFields = () => {
    if (!storage.instance) {
      throw StorageProvider.UninitializedError;
    }

    setDataKey(storage.instance.key);
    setDataValue(JSON.stringify(storage.data, null, 2));
  }

  const onOpen = () => {
    initFields();
    setError('');
    setOpen(true);
  }

  const onOpenChange = () => {
    if (open) {
      setOpen(false);
    }
  }

  const onSave = () => {
    if (!storage.instance) {
      throw StorageProvider.UninitializedError;
    }

    else if (!dispatchStorage) {
      throw Error('No provider of storage dispatch');
    }

    try {
      const newData = DataStorage.verifiedData(JSON.parse(dataValue));

      setOpen(false);

      dispatchStorage({
        type: 'update',
        newData: newData,
      });

    } catch (error) {
      setError('Value is invalid. Schema issue or bad JSON syntax.');
      setShaking(true);

      if (error instanceof Error) {
        console.log(error.message);
      }

      return;
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogTrigger asChild>
        <Button
          variant='outline'
          onClick={onOpen}
        >
          <FileCog className='h-[1.2rem] w-[1.2rem]' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            Edit Power-Up Data
          </DialogTitle>
          <DialogDescription>
            Make changes to Power-Up chart data.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid w-full gap-1.5 grid-cols-4 items-start'>
            <Label htmlFor='data-key' className='pt-[14px]'>
              Key
            </Label>
            <Input
              disabled
              id='data-key'
              placeholder='Enter storage key here'
              className='col-span-3'
              value={dataKey}
              onChange={e => setDataKey(e.target.value)}
            />
          </div>
          <div className='grid w-full gap-1.5 grid-cols-4 items-start'>
            <Label htmlFor='data-value' className='pt-[14px]'>
              Value
            </Label>
            <Textarea
              id='data-value'
              placeholder='Enter JSON value here'
              className={cn(
                shaking ? 'animate-shake-once' : '',
                error && 'border-1 border-solid border-destructive',
                'col-span-3 max-h-[25vh]'
              )}
              onAnimationEnd={() => setShaking(false)}
              value={dataValue}
              onChange={e => {
                setDataValue(e.target.value)
                setError(''); /* Clear error state. */
              }}
            />
          </div>
          <p className={cn(
            'text-sm text-muted-foreground text-center sm:text-left',
            error && 'text-destructive'
          )}
          >
            {error ? error : 'Chart and its options will reflect your changes.'}
          </p>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            onClick={onSave}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}