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

  const [dialogContentRef, setDialogContentRef] = useState<(HTMLElement | null)>(null);

  const computeLoc = useCallback((ref: HTMLElement, xAnchor: 'left' | 'right' | 'center', yAnchor: 'bottom' | 'top' | 'center') => {
    let x: number, y: number;

    switch (xAnchor) {
      case 'left':
        x = ref.offsetLeft;
        break;
      case 'right':
        x = ref.offsetLeft + ref.offsetWidth;
        break;
      case 'center':
        x = ref.offsetLeft + (ref.offsetWidth / 2);
        break;
    }

    switch (yAnchor) {
      case 'top':
        y = ref.offsetTop;
        break;
      case 'bottom':
        y = ref.offsetTop + ref.offsetHeight;
        break;
      case 'center':
        y = ref.offsetTop + (ref.offsetHeight / 2);
        break;
    };

    return { x: x, y: y };
  }, []);

  const lineToList = useCallback((fromLoc: { x: number, y: number }, toLoc: { x: number, y: number }, radius: number) => {
    /* Draw a straight line without rounding if chart and column headings X
     * coordinate values are close. We do not compare with ===, because
     * sometimes they are off by 0.5. Compare with radius here to be safe. */
    if (Math.abs(fromLoc.x - toLoc.x) <= radius) {
      return `M${fromLoc.x} ${fromLoc.y} V${toLoc.y}`;
    }

    const yd = (toLoc.y - fromLoc.y) / 2;
    const r = Math.min(yd, radius);
    const rx = (fromLoc.x < toLoc.x ? -1 : 1) * r;

    return `M ${toLoc.x} ${toLoc.y} v -${yd - r} q 0 -${r} ${rx} -${r} h ${fromLoc.x - toLoc.x - (2 * rx)} q ${rx} 0 ${rx} -${r} V ${fromLoc.y}`;
  }, []);

  const lineToCard = useCallback((fromLoc: { x: number, y: number }, toLoc: { x: number, y: number }, radius: number) => {
    const xc = fromLoc.x + (toLoc.x - fromLoc.x) / 2;
    // return `M ${xc} ${fromLoc.y} L ${toLoc.x} ${toLoc.y}`;
    return `M ${xc} ${fromLoc.y} V ${toLoc.y - radius} Q ${xc} ${toLoc.y} ${xc + radius} ${toLoc.y}`;
  }, []);

  /* Pre-render line flakes once the dialog content is mounted regardless of
   * whether the user wants to show lines or not, as this will save resources
   * if they constantly toggle lines on and off. */
  const chartContentLineFlakesPrep = useMemo(() => {
    if (!dialogContentRef) return null;

    const radius = 12;
    const error = (s: string) => `Failed to find ${s}. Component is either not mounted or id is not set`;

    const chartHeading = dialogContentRef?.children.namedItem('chart-heading');
    if (!chartHeading || !(chartHeading instanceof HTMLElement)) throw Error(error('chart heading'));

    const chartColumns = dialogContentRef?.children.namedItem('chart-columns');
    if (!chartColumns) throw Error(error('chart columns'));

    const chartHeadingLoc = computeLoc(chartHeading, 'center', 'bottom');

    return (
      <svg
        id='chart-flakes-lines'
        xmlns='http://www.w3.org/2000/svg'
        strokeWidth='2'
        fill='none'
        className='z-1 absolute left-0 top-0 w-full h-full stroke-[var(--border)] dark:stroke-[#222222]'
      >
        <path d={
          Array.from(chartColumns.children)
            .map((columnRef) => {
              const chartColumnHeading = columnRef.children.namedItem('chart-column-heading');
              if (!chartColumnHeading || !(chartColumnHeading instanceof HTMLElement)) throw Error(error('chart column heading'));

              const chartColumnHeadingLoc = computeLoc(chartColumnHeading, 'center', 'top');

              const chartCards = columnRef.children.namedItem('chart-rows');
              if (!chartCards) throw Error(error('chart rows'));

              const chartColumnHeadingLeftLoc = computeLoc(chartColumnHeading, 'left', 'center');

              const linesToCards = Array.from(chartCards.children)
                .map((cardRef) => {
                  if (!(cardRef instanceof HTMLElement)) throw Error(error('chart card'));
                  return lineToCard(chartColumnHeadingLeftLoc, computeLoc(cardRef, 'left', 'center'), radius);
                })
                .reduce((prev, curr) => prev + curr, '');

              return lineToList(chartHeadingLoc, chartColumnHeadingLoc, radius) + linesToCards;

            })
            .reduce((prev, curr) => prev + curr)
        }
        />
      </svg>

    );
  }, [dialogContentRef, computeLoc, lineToList, lineToCard]);

  const chartContentLineFlakes = useMemo(
    () => showLines ? chartContentLineFlakesPrep : null,
    [showLines, chartContentLineFlakesPrep]
  );

  const chartContentInner = useMemo(() => (
    <>
      <Card id='chart-heading' className='z-2 w-fit py-6 px-32 mb-4'>
        <CardContent>
          <p className='text-2xl font-bold'>{data.name}</p>
        </CardContent>
      </Card>
      <div
        id='chart-columns'
        className='z-2 grid grid-flow-col gap-[32px] justify-center items-stretch'
        /* We do not know the number of columns beforehand, hence the style value is specified directly. */
        style={{ gridTemplateColumns: `repeat(${data.lists.length}, minmax(0, 1fr))` }}
      >
        {data.lists.map((list) => (
          <div id='chart-column' key={list.id}>
            <Card id='chart-column-heading' className='self-auto py-4 mb-6'>
              <CardContent className='h-full content-center'>
                <p className='text-xl font-semibold text-center'>{list.name}</p>
              </CardContent>
            </Card>
            <div id='chart-rows' className='flex flex-col gap-4'>
              {list.cards.map((card, index) => (
                <Card id='chart-row' key={index} className={cn(
                  'w-fit max-w-xs ml-6 mr-2 py-4',
                  (showCompleted && card.isComplete) && 'line-through text-muted-foreground opacity-80 motion-safe:animate-scale-once'
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
    </>
  ), [data, showCompleted]);

  const chartContent = useMemo(() => (
    <div ref={setDialogContentRef} className='flex flex-col items-center justify-center gap-[32px] w-max'>
      {chartContentInner}
      {chartContentLineFlakes}
    </div>
  ), [chartContentInner, chartContentLineFlakes]);

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
      <Button variant='outline'>
        <SlidersHorizontal className='h-[1.2rem] w-[1.2rem]' />
      </Button>
    </DropdownMenuTrigger>
  ), []);

  const dialogOptions = useMemo(() => (
    <DropdownMenu>
      {dialogOptionsTrigger}
      <DropdownMenuContent className='w-56'>
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