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

import { Check, ChevronsUpDown, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/src/lib/utils';

import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';

import ThemeSwitch from './theme';

import { DraggableCore } from 'react-draggable';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';

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

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';

import * as Data from '@/src/types/data';
import * as StorageProvider from '../providers/storage';

type Checked = DropdownMenuCheckboxItemProps['checked'];

const ListOptionsSchema = Data.ListSchema.pick({ id: true, name: true }).extend({
  selected: z.boolean()
}).strict();

const BoardOptionsSchema = Data.BoardSchema.pick({ id: true, name: true }).extend({
  lists: ListOptionsSchema.array()
}).strict();

const OptionsSchema = z.object({
  board: BoardOptionsSchema.refine((board) => {
    return board.id && board.name && board.lists.filter(({ selected }) => selected).length;
  }),
  boards: BoardOptionsSchema.array(),
}).strict();

type Options = z.infer<typeof OptionsSchema>;
type BoardOptions = z.infer<typeof BoardOptionsSchema>;

const UndefinedBoard: BoardOptions = {
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

  const closedChartDialog = useMemo(() => (
    <ChartDialog
      open={false}
      data={{ id: '', name: '', lists: [] }}
    />
  ), []);

  const chartDialog = useMemo(() => {
    if (!open) {
      return closedChartDialog;
    }

    const boardOptions = optionsForm.current.getValues().board;

    const data = storage.data.find(({ id }) => id === boardOptions.id);
    if (!data) {
      console.error('Unrecognized Trello Board ID. Reload the page');
      return closedChartDialog;
    }

    return (
      <ChartDialog
        open={open}
        onOpenChange={setOpen}
        placeholder={optionsForm.current.getValues().board.name}
        data={{
          ...data,
          lists: data.lists.filter((_value, index) => boardOptions.lists[index].selected)
        }}
      />
    );
  }, [open, closedChartDialog, storage.data]);

  const formField = useMemo(() => (
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
  ), [storage.data]);

  const chartTrigger = useMemo(() => (
    <Button className='w-max sm:w-full' type='submit'>See my chart</Button>
  ), []);

  return (
    <Form {...optionsForm.current}>
      <form className='grid gap-4 items-center justify-items-center sm:items-start sm:justify-items-start pb-[64px] sm:pb-0' onSubmit={optionsForm.current.handleSubmit(onSubmit)}>
        {formField}
        {chartTrigger}
        {chartDialog}
      </form>
    </Form>
  );
}

export function ChartDialog({
  open,
  onOpenChange,
  placeholder,
  data,
}: {
  open: boolean,
  onOpenChange?: (open: boolean) => void,
  placeholder?: string,
  data: Data.Board, /* Filtered lists are assumed. */
}) {
  const dragControlRef = useRef<HTMLDivElement>(null!);
  const targetRef = useRef<HTMLDivElement>(null!);
  const targetTranslate = useRef({ x: 0, y: 0 });

  const [showCompleted, setShowCompleted] = useState<Checked>(true)
  const [showLines, setShowLines] = useState<Checked>(true)

  const chartContent = useMemo(() => (
    <div className='flex flex-col items-center justify-center gap-[32px] w-max'>
      <Card className='w-fit py-6 px-32 mb-4'>
        <CardContent>
          <p className='text-2xl font-bold'>{data.name}</p>
        </CardContent>
      </Card>
      <div
        className='grid grid-flow-col gap-[32px] justify-center items-stretch'
        /* We do not know the number of columns beforehand, hence the style value is specified directly. */
        style={{ gridTemplateColumns: `repeat(${data.lists.length}, minmax(0, 1fr))` }}
      >
        {data.lists.map((list) => (
          <div key={list.id}>
            <Card className='self-auto py-4 mb-6'>
              <CardContent className='h-full content-center'>
                <p className='text-xl font-semibold text-center'>{list.name}</p>
              </CardContent>
            </Card>
            <div className='flex flex-col gap-4'>
              {list.cards.map((card, index) => (
                <Card key={index} className={cn(
                  'w-fit max-w-xs ml-6 mr-2 py-4',
                  (showCompleted && card.isComplete) && 'line-through text-muted-foreground opacity-80'
                )}>
                  <CardContent className='flex flex-row items-center gap-4'>
                    {(showCompleted && card.isComplete) ? (
                      <Check width='16' height='16' color='var(--color-green-500)' className='min-w-[16px] min-h-[16px] w-[16px] h-[16px]' />
                    ) : null}
                    <p>{card.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [data, showCompleted, showLines]);

  const dialogContent = useMemo(() => (
    <DraggableCore
      nodeRef={dragControlRef}
      onDrag={(_e, data) => {
        if (!targetRef || !dragControlRef) return;

        targetTranslate.current.x += data.deltaX;
        targetTranslate.current.y += data.deltaY;

        targetRef.current.style.setProperty('--translate-x', `${targetTranslate.current.x}px`);
        targetRef.current.style.setProperty('--translate-y', `${targetTranslate.current.y}px`);
      }}
    >
      <div ref={dragControlRef} className='overflow-hidden grid gap-4 h-[100%] border-1 border-solid rounded-lg cursor-move'>
        <TransformWrapper
          smooth={false}
          limitToBounds
          disablePadding
          centerOnInit
          alignmentAnimation={{ disabled: true }}
          velocityAnimation={{ disabled: true }}
          zoomAnimation={{ disabled: true }}
          doubleClick={{ disabled: true }}
          panning={{ disabled: true }}
          pinch={{ step: .01 }}
          wheel={{ step: .01 }}
          minScale={.2}
          maxScale={6}
        >
          <TransformComponent wrapperStyle={{ height: '100%', width: '100%' }}>
            <div ref={targetRef} style={{ transform: 'translate(var(--translate-x), var(--translate-y))' }}>
              {chartContent}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </DraggableCore>
  ), [chartContent]);

  const dialogOptionsTrigger = useMemo(() => (
    <DropdownMenuTrigger asChild>
      <Button variant="outline">
        <SlidersHorizontal className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    </DropdownMenuTrigger>
  ), []);

  const dialogOptions = useMemo(() => (
    <DropdownMenu>
      {dialogOptionsTrigger}
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showCompleted}
          onCheckedChange={setShowCompleted}
        >
          Show completed
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showLines}
          onCheckedChange={setShowLines}
          disabled
        >
          Show lines
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu >
  ), [dialogOptionsTrigger, showCompleted, showLines]);

  const dialogHeader = useMemo(() => (
    <DialogHeader>
      <DialogTitle>Work breakdown structure chart</DialogTitle>
      <DialogDescription></DialogDescription>
    </DialogHeader>
  ), []);

  const dialogFooter = useMemo(() => (
    <DialogFooter className='h-max'>
      <div className='w-[100%] flex justify-between items-center'>
        <p>{placeholder}</p>
        <div className='h-[100%] flex gap-[16px] justify-end items-center'>
          <Separator orientation='vertical' />
          {dialogOptions}
          <ThemeSwitch />
        </div>
      </div>
    </DialogFooter>
  ), [dialogOptions, placeholder]);

  const dialog = useMemo(() => (
    <DialogContent className='h-[100vh] max-w-[100vw] sm:h-[95vh] sm:max-w-[95vw] sm:rounded-lg flex flex-col justify-between'>
      {dialogHeader}
      {dialogContent}
      {dialogFooter}
    </DialogContent>
  ), [dialogHeader, dialogContent, dialogFooter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialog}
    </Dialog>
  );
}