/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import { Check, ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/src/lib/utils';

import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

import ThemeSwitch from './theme';

import { DraggableCore } from 'react-draggable';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

import {
  Form,
  FormControl,
  FormField,
  FormItem
} from './ui/form';

import * as Data from '@/src/types/data';
import * as StorageProvider from '../providers/storage';

const OptionListSchema = Data.ListSchema.pick({ id: true, name: true }).extend({
  selected: z.boolean()
}).strict();

const OptionBoardSchema = Data.BoardSchema.pick({ id: true, name: true }).extend({
  lists: OptionListSchema.array()
}).strict();

const OptionsSchema = z.object({
  board: OptionBoardSchema.refine((board) => {
    return board.id && board.name && board.lists.filter(({ selected }) => selected).length;
  }),
  boards: OptionBoardSchema.array(),
}).strict();

type Options = z.infer<typeof OptionsSchema>;

const UndefinedBoard: z.infer<typeof OptionBoardSchema> = {
  id: '',
  name: '',
  lists: []
};

function makeOptions(fromData: Data.Boards, oldOptions: Options | null): Options {
  return {
    board: UndefinedBoard,
    boards: fromData.map(({ id, name, lists }) => {
      const oldBoard = oldOptions?.boards.find((oldBoard) => oldBoard.id === id);

      return {
        id: id,
        name: name,
        lists: lists.map(({ id, name }) => {
          const oldList = oldBoard?.lists.find((oldList) => oldList.id === id);

          return {
            id: id,
            name: name,
            selected: oldList ? oldList.selected : true
          }
        })
      };
    })
  };
}

export function Chart() {
  const [open, setOpen] = useState(false);

  const storage = useContext(StorageProvider.Context);

  const optionsForm = useRef(useForm<Options>({
    resolver: zodResolver(OptionsSchema),
    defaultValues: makeOptions(storage.data, null)
  }));

  const onSubmit = useCallback((values: Options) => {
    console.log(JSON.stringify(values.board, null, 2));
    setOpen(true);
  }, []);

  useEffect(() => {
    optionsForm.current.reset({
      ...makeOptions(storage.data, optionsForm.current.getValues()),
      board: UndefinedBoard
    });
  }, [storage.data]);


  return (
    <Form {...optionsForm.current}>
      <form className='grid gap-4 items-center justify-items-center sm:items-start sm:justify-items-start pb-[64px] sm:pb-0' onSubmit={optionsForm.current.handleSubmit(onSubmit)}>
        <FormField
          control={optionsForm.current.control}
          name='board'
          render={({ field }) => (
            <FormItem className='flex flex-col gap-[16px] items-center justify-center sm:justify-start sm:items-start'>
              <div className='flex flex-row gap-[16px] flex-wrap items-center justify-center sm:justify-start sm:items-start'>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='aria-[invalid=true]:border-destructive aria-[invalid=true]:dark:border-destructive animate-none aria-[invalid=true]:animate-shake-once w-[200px] justify-between disabled:cursor-not-allowed disabled:opacity-50'
                      >
                        {field.value?.id ? field.value.name : 'Select Trello board...'}
                        <ChevronsUpDown className='opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[200px] p-0'>
                    <Command
                      filter={(value, search, keywords) => {
                        if (value.includes(search)) return 1;
                        else if (keywords?.some(keyword => keyword.includes(search))) return 1;
                        else return 0;
                      }}
                    >
                      <CommandInput placeholder='Search board...' className='h-9' />
                      <CommandList>
                        <CommandEmpty>No boards found.</CommandEmpty>
                        <CommandGroup>
                          {storage.data.map((board: Data.Board) => (
                            <CommandItem
                              key={board.id}
                              value={board.id}
                              keywords={[board.name.toLowerCase()]}
                              onSelect={(value) => {
                                const boards = optionsForm.current.getValues('boards');

                                if (value === field.value.id) {
                                  optionsForm.current.reset({
                                    board: UndefinedBoard,
                                    boards: boards,
                                  });
                                }

                                else {
                                  const newBoard = optionsForm.current.getValues().boards.find(({ id }) => value === id) ?? UndefinedBoard;
                                  optionsForm.current.reset({
                                    board: newBoard,
                                    boards: boards,
                                  });
                                }
                              }}
                            >
                              {board.name}
                              <Check
                                className={cn(
                                  'ml-auto',
                                  field.value.id === board.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        disabled={!field.value?.id}
                        variant='outline'
                        role='combobox'
                        className='aria-[invalid=true]:border-destructive aria-[invalid=true]:dark:border-destructive animate-none aria-[invalid=true]:animate-shake-once row-start-1 w-[200px] justify-between disabled: cursor-not-allowed disabled:opacity-50'
                      >
                        {(() => {
                          const selected = field.value?.lists.filter(({ selected }) => selected).length ?? 0;
                          if (selected == 0) return 'Select Trello Lists...';
                          return selected === field.value?.lists.length ? 'All lists' : `${selected}/${field.value?.lists.length} lists`;
                        })()}
                        <ChevronsUpDown className='opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[200px] p-0'>
                    <Command
                      filter={(value, search, keywords) => {
                        if (value.includes(search)) return 1;
                        else if (keywords?.some(keyword => keyword.includes(search))) return 1;
                        else return 0;
                      }}
                    >
                      <CommandInput placeholder='Search list...' className='h-9' />
                      <CommandList>
                        <CommandEmpty>No lists found.</CommandEmpty>
                        <CommandGroup>
                          {field.value?.lists.map((list) => (
                            <CommandItem
                              key={list.id}
                              value={list.id}
                              keywords={[list.name.toLowerCase()]}
                              onSelect={(value) => {
                                if (!field.value) return;

                                const boards = optionsForm.current.getValues('boards');

                                const board = boards.find(({ id }) => id === field.value.id);
                                if (!board) return;

                                const list = board.lists.find(({ id }) => id === value);
                                if (!list) return;

                                list.selected = !list.selected;

                                optionsForm.current.reset({
                                  board: board,
                                  boards: boards,
                                });
                              }}
                            >
                              {list.name}
                              <Checkbox
                                checked={list.selected}
                                className={cn(
                                  'ml-auto',
                                  list.selected ? 'opacity-100' : 'opacity-50'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <p className='text-[0.8rem] text-muted-foreground text-center sm:text-left'>
                Select which Trello board and lists to show on the chart.
              </p>
            </FormItem>
          )}
        >
        </FormField>
        <Button className='w-max sm:w-full' type='submit'>See my chart</Button>
      </form>
    </Form>
  );
}