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
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel
} from './ui/form';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

import * as StorageProvider from '../providers/storage';
import { DataStorage } from '../lib/data';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  key: z.string().min(1),
  value: z.custom<string>(((value) => {
    try {
      DataStorage.verifiedData(JSON.parse(value));
      return true;
    } catch {
      return false;
    }
  }))
}).strict();

type formSchemaType = z.infer<typeof formSchema>;

export function DataTool() {
  const [open, setOpen] = useState(false);

  const storage = useContext(StorageProvider.Context);
  const dispatchStorage = useContext(StorageProvider.DispatchContext);

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: formSchemaType) => {
    if (!storage.instance) {
      throw StorageProvider.UninitializedError;
    }

    else if (!dispatchStorage) {
      throw Error('No provider of storage dispatch');
    }

    setOpen(false);

    dispatchStorage({
      type: 'update',
      newData: JSON.parse(values.value),
    });

  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => { if (open) setOpen(false) }}
    >
      <DialogTrigger asChild>
        <Button
          variant='outline'
          onClick={() => {
            if (!storage.instance) {
              throw StorageProvider.UninitializedError;
            }

            form.reset({
              key: storage.instance.key,
              value: JSON.stringify(storage.data, null, 2)
            });

            setOpen(true);
          }}
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
        <Form
          {...form}
        >
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='grid gap-4 pt-4'
          >
            <FormField
              control={form.control}
              name='key'
              render={({ field }) => (
                <FormItem className='grid w-inherit gap-1.5 grid-cols-4 content-center'>
                  <FormLabel>Key</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      placeholder='Enter storage key here'
                      className='col-span-3'
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='value'
              render={({ field }) => (
                <FormItem className='grid w-inherit gap-1.5 grid-cols-4 content-start'>
                  <FormLabel className='h-min pt-[14px]'>Value</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter JSON value here'
                      className='animate-none aria-[invalid=true]:animate-shake-once col-span-3 max-h-[25vh]'
                      {...field}
                    />
                  </FormControl>
                  <div className='col-span-full pt-4'>
                    <FormLabel className='data-[error=true]:hidden flex text-sm text-muted-foreground data-[error=true]:text-destructive text-center sm:text-left'>
                      Chart and its options will reflect your changes.
                    </FormLabel>
                    <FormLabel className='hidden data-[error=true]:flex text-sm text-muted-foreground data-[error=true]:text-destructive text-center sm:text-left'>
                      Value is invalid. Schema issue or bad JSON syntax.
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <div className='w-inherit flex justify-end pt-4'>
              <Button type='submit'>Save changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}