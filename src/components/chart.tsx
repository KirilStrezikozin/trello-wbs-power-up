/**
 * Copyright (c) 2025 Kiril Strezikozin
 *
 * SPDX-License-Identifier: MIT
 *
 * You may not use this file except in compliance with the MIT license terms.
 */

'use client'

import { useContext, useEffect, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { z } from 'zod';
import { cn } from '@/src/lib/utils';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

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

import * as Data from '@/src/types/data';
import * as StorageProvider from '../providers/storage';

const OptionListSchema = Data.ListSchema.pick({ id: true, name: true }).extend({
  selected: z.boolean()
}).strict();

const OptionBoardSchema = Data.BoardSchema.pick({ name: true }).extend({
  id: z.string({
    required_error: 'Please select a Trello board.',
  }).min(1, { message: 'Please select a Trello board.' }),

  lists: OptionListSchema.array()
}).strict();

const OptionsSchema = z.object({
  board: OptionBoardSchema,
  boards: OptionBoardSchema.array(),
}).partial({ board: true }).strict();

type Options = z.infer<typeof OptionsSchema>;

function makeOptions(fromData: Data.Boards, oldOptions: Options | null): Options {
  return {
    board: undefined,
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

function ChartOptionCommand({
  children,
  open,
  onOpenChange,
  disabled = false,
  triggerText,
  incompleteStatus = { shake: false, red: false },
  onIncompleteAnimationStart,
  onIncompleteAnimationEnd,
}: Readonly<{
  children: React.ReactNode
}> & {
  open: boolean,
  onOpenChange?: (open: boolean) => void,
  disabled?: boolean,
  triggerText: string,
  incompleteStatus?: { shake: boolean, red: boolean },
  onIncompleteAnimationStart?: () => void,
  onIncompleteAnimationEnd?: () => void,
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            incompleteStatus.shake && 'animate-shake-once',
            incompleteStatus.red && 'border-1 border-solid border-destructive dark:border-1 dark:border-solid dark:border-destructive',
            'w-[200px] justify-between disabled: cursor-not-allowed disabled:opacity-50'
          )}
          onAnimationStart={onIncompleteAnimationStart}
          onAnimationEnd={onIncompleteAnimationEnd}
        >
          {triggerText}
          <ChevronsUpDown className='opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[200px] p-0'>
        <Command
          filter={(value, search, keywords) => {
            if (value.includes(search)) return 1;
            else if (keywords?.some(keyword => keyword.includes(search))) return 1;
            else return 0;
          }}
        >
          {children}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function ChartOptions() {
  const storage = useContext(StorageProvider.Context);

  const [options, setOptions] = useState<Options>(makeOptions(storage.data, null));

  const [boardsOpen, setBoardsOpen] = useState(false);
  const [listsOpen, setListsOpen] = useState(false);

  const [incompleteStatus, setIncompleteStatus] = useState({
    board: { shake: false, red: false },
    list: { shake: false, red: false },
  });

  useEffect(() => {
    setIncompleteStatus({
      board: { shake: false, red: false },
      list: { shake: false, red: false }
    });

    setOptions({
      ...makeOptions(storage.data, options),
      board: undefined
    });
    /* Do not pass `options` as hook dependency, because we do not want to
     * remake options from scratch whenever they change. When new data in
     * storage becomes available, we simply inspect whatever options value we
     * had at that point, even if they were stale, and migrate to new ones. */
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [storage.data]);

  function onClick(fromData: Options) {
    console.log(JSON.stringify(fromData, null, 2));

    if (!options.board) {
      setIncompleteStatus({
        ...incompleteStatus,
        board: { shake: true, red: true }
      });
      return;
    }

    else if (!options.board.lists.filter(({ selected }) => selected)?.length) {
      setIncompleteStatus({
        ...incompleteStatus,
        list: { shake: true, red: true }
      });
      return;
    }

    const res = OptionsSchema.safeParse(fromData);
    if (!res.success) {
      console.error('Validation error: ' + res.error);
    }
  }

  const listTriggerText = () => {
    const defaultText = 'Select Trello lists...';
    if (!options.board) return defaultText;

    const countSelected = options.board.lists.filter(({ selected }) => selected).length ?? 0;
    if (!countSelected) return defaultText;

    if (options.board.lists.length === countSelected) return 'All lists';
    return countSelected + '/' + options.board.lists.length + ' lists';
  }

  return (
    <>
      <div className='flex flex-col gap-[16px] items-center justify-center sm:justify-start sm:items-start'>
        <div className='flex flex-row gap-[16px] flex-wrap items-center justify-center sm:justify-start sm:items-start'>
          <ChartOptionCommand
            key='board'
            open={boardsOpen}
            onOpenChange={setBoardsOpen}
            triggerText={options.board ? options.board.name : 'Select Trello board...'}
            incompleteStatus={incompleteStatus.board}
            onIncompleteAnimationStart={() => {
              setIncompleteStatus({
                ...incompleteStatus,
                board: { shake: true, red: true }
              });
            }}
            onIncompleteAnimationEnd={() => {
              setIncompleteStatus({
                ...incompleteStatus,
                board: { ...incompleteStatus.board, shake: false }
              });
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
                      if (value === options.board?.id) {
                        setOptions({
                          ...options,
                          board: undefined
                        });
                      }

                      else {
                        setOptions({
                          ...options,
                          board: options.boards.find(({ id }) => value === id)
                        });
                      }

                      setBoardsOpen(false);

                      setIncompleteStatus({
                        board: { shake: false, red: false },
                        list: { shake: false, red: false }
                      });
                    }}
                  >
                    {board.name}
                    <Check
                      className={cn(
                        'ml-auto',
                        options.board?.id === board.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ChartOptionCommand>
          <ChartOptionCommand
            key='list'
            disabled={!options.board}
            open={listsOpen}
            onOpenChange={setListsOpen}
            triggerText={listTriggerText()}
            incompleteStatus={incompleteStatus.list}
            onIncompleteAnimationStart={() => {
              setIncompleteStatus({
                ...incompleteStatus,
                list: { shake: true, red: true }
              });
            }}
            onIncompleteAnimationEnd={() => {
              setIncompleteStatus({
                ...incompleteStatus,
                list: { ...incompleteStatus.list, shake: false }
              });
            }}
          >
            <CommandInput placeholder='Search list...' className='h-9' />
            <CommandList>
              <CommandEmpty>No lists found.</CommandEmpty>
              <CommandGroup>
                {options.board?.lists.map((list) => (
                  <CommandItem
                    key={list.id}
                    value={list.id}
                    keywords={[list.name.toLowerCase()]}
                    onSelect={(value) => {
                      if (!options.board) return;

                      const list = options.board.lists.find(({ id }) => id === value);
                      if (list) {
                        list.selected = !list.selected;

                        setOptions({
                          ...options,
                        });
                      }

                      setIncompleteStatus({
                        ...incompleteStatus,
                        list: { shake: false, red: false }
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
          </ChartOptionCommand>
        </div>
        <p
          className={cn(
            'text-[0.8rem] text-muted-foreground text-center sm:text-left',
            (incompleteStatus.board.red || incompleteStatus.list.red) && 'text-destructive'
          )}
        >
          Select which Trello board and lists to show on the chart.
        </p>
      </div>
      <Button onClick={() => onClick(options)}>
        See my chart
      </Button>
    </>
  )
}