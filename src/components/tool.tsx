/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { FileCog } from 'lucide-react';
import { useState } from 'react';

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

import { useMounted } from '../hooks/use-mounted';

import { DataStorage } from '../lib/data';
import { cn } from '../lib/utils';

export function DataTool() {
  const mounted = useMounted();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);

  const [dataKey, setDataKey] = useState('');
  const [dataValue, setDataValue] = useState('');

  /* Render the data tool on the client. */
  if (!mounted /* || !IsDevelopment() */) {
    return (
      <>
      </>
    );
  }

  const origin = window.location.origin;
  const storage = DataStorage.getInstance(window, origin);

  const initFields = () => {
    setDataKey(DataStorage.getDefaultKey(origin));
    setDataValue(JSON.stringify(storage.read(), null, 2));
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
    try {
      storage.update(JSON.parse(dataValue));
      setOpen(false);
    } catch {
      setShaking(true);
      setError('Value is invalid. Schema issue or bad JSON syntax.');
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