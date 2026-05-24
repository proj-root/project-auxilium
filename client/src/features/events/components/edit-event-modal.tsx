/**
 * This file is a horrible example of clean code
 * Please do not follow the conventions here
 * I normally don't do this, but stuffing everything in a single component would make it
 * easier just this once for this dialog form
 */

import * as z from 'zod';
import {
  useGetAllEventTypesQuery,
  useUpdateEventMutation,
} from '../state/events-api-slice';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon, Edit2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const formSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  eventTypeId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  platform: z.string().optional(),
  signupUrl: z.string().optional(),
  feedbackUrl: z.string().optional(),
  helpersUrl: z.string().optional(),
});

type EditEventFormValues = z.infer<typeof formSchema>;

export function EditEventModal({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) {
  // TODO: Pre-fill all form fields with current event data

  const [updateEvent, { isLoading }] = useUpdateEventMutation();
  const { data: eventTypes } = useGetAllEventTypesQuery();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: {
      name: undefined
    }
  });

  const onSubmit = async (data: EditEventFormValues) => {
    // Filter out empty strings and undefined values to prevent overwriting existing data
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== '' && value !== undefined)
    );

    // Don't send if no fields are actually being updated
    if (Object.keys(cleanedData).length === 0) {
      toast.error('Please fill in at least one field to update');
      return;
    }

    try {
      await updateEvent({ eventId, ...cleanedData }).unwrap();
      toast.success('Event updated succesfully!');
    } catch (error: any) {
      console.error('EditEventForm Error:', error);
      toast.error(error.data.message);
    } finally {
      // Close the modal
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={'secondary'} size={'sm'}>
          <Edit2 className='size-4' />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className='flex flex-row items-center gap-2'>
              Edit Event <Edit2 className='size-4' />
            </DialogTitle>
            <DialogDescription>Remember to save your changes</DialogDescription>
          </DialogHeader>
          <div className='scrollbar-none flex max-h-[50vh] flex-col gap-4 overflow-y-scroll'>
            {/* Event Name */}
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='name'>Event Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='text'
                    placeholder='How To...'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Event Description */}
            <Controller
              name='description'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='description'>Description</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder='A really really cool workshop...'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Event Type */}
            <Controller
              name='eventTypeId'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation={'responsive'}
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor='eventTypeId'>Event Type</FieldLabel>
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id='eventTypeId'>
                      <SelectValue placeholder='Select an event type' />
                    </SelectTrigger>
                    <SelectContent position='item-aligned'>
                      {eventTypes?.data.map((type) => (
                        <SelectItem
                          key={type.name}
                          value={type.eventTypeId.toString()}
                        >
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            {/* Platform */}
            <Controller
              name='platform'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation={'responsive'}
                  data-invalid={fieldState.invalid}
                >
                  <FieldContent>
                    <FieldLabel htmlFor='platform'>Platform</FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id='platform'>
                      <SelectValue placeholder='Select a platform' />
                    </SelectTrigger>
                    {/* TODO: Hardcoded options; make flexible next time */}
                    <SelectContent position='item-aligned'>
                      <SelectItem value='MSTeams'>Microsoft Teams</SelectItem>
                      <SelectItem value='Discord'>Discord</SelectItem>
                      <SelectItem value='Offline'>Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            {/* Start Date and Time */}
            <Controller
              name='startDate'
              control={form.control}
              render={({ field, fieldState }) => {
                const [open, setOpen] = useState(false);
                const date = field.value;
                const timeString = date
                  ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
                  : '15:00';

                const handleTimeChange = (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const [hours, minutes] = e.target.value.split(':');
                  if (date) {
                    const newDate = new Date(date);
                    newDate.setHours(
                      parseInt(hours as string),
                      parseInt(minutes as string),
                      0,
                    );
                    field.onChange(newDate);
                  }
                };

                return (
                  <FieldGroup className='flex-row items-end gap-4'>
                    <Field>
                      <FieldLabel htmlFor='startDate'>
                        Start Date & Time
                      </FieldLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            id='startDate'
                            className='w-12 justify-between'
                          >
                            {date ? format(date, 'PPP') : 'Select date'}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-auto overflow-hidden p-0'
                          align='start'
                        >
                          <Calendar
                            mode='single'
                            selected={date}
                            defaultMonth={date}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                if (date) {
                                  selectedDate.setHours(
                                    date.getHours(),
                                    date.getMinutes(),
                                    date.getSeconds(),
                                  );
                                }
                                field.onChange(selectedDate);
                              }
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field className='w-32'>
                      {/* <FieldLabel htmlFor='startTime'>Time</FieldLabel> */}
                      <Input
                        type='time'
                        id='startTime'
                        step='60'
                        value={timeString}
                        onChange={handleTimeChange}
                        className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                      />
                    </Field>
                  </FieldGroup>
                );
              }}
            />

            {/* End Date and Time */}
            <Controller
              name='endDate'
              control={form.control}
              render={({ field, fieldState }) => {
                const [open, setOpen] = useState(false);
                const date = field.value;
                const timeString = date
                  ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
                  : '17:00';

                const handleTimeChange = (
                  e: React.ChangeEvent<HTMLInputElement>,
                ) => {
                  const [hours, minutes] = e.target.value.split(':');
                  if (date) {
                    const newDate = new Date(date);
                    newDate.setHours(
                      parseInt(hours as string),
                      parseInt(minutes as string),
                      0,
                    );
                    field.onChange(newDate);
                  }
                };

                return (
                  <FieldGroup className='flex-row items-end gap-4'>
                    <Field>
                      <FieldLabel htmlFor='endDate'>End Date & Time</FieldLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            id='endDate'
                            className='w-32 justify-between'
                          >
                            {date ? format(date, 'PPP') : 'Select date'}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-auto overflow-hidden p-0'
                          align='start'
                        >
                          <Calendar
                            mode='single'
                            selected={date}
                            defaultMonth={date}
                            onSelect={(selectedDate) => {
                              if (selectedDate) {
                                if (date) {
                                  selectedDate.setHours(
                                    date.getHours(),
                                    date.getMinutes(),
                                    date.getSeconds(),
                                  );
                                }
                                field.onChange(selectedDate);
                              }
                              setOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field className='w-32'>
                      {/* <FieldLabel htmlFor='endTime'>Time</FieldLabel> */}
                      <Input
                        type='time'
                        id='endTime'
                        step='60'
                        value={timeString}
                        onChange={handleTimeChange}
                        className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
                      />
                    </Field>
                  </FieldGroup>
                );
              }}
            />

            {/* Signup URL */}
            <Controller
              name='signupUrl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='signupUrl'>
                    Signup Responses Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='text'
                    placeholder='e.g. https://docs.google.com/spreadsheets/d/wSfAhwE293nMMFfjsnfkj23j243...'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Feedback URL */}
            <Controller
              name='feedbackUrl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='signupUrl'>
                    Feedback Responses Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='text'
                    placeholder='e.g. https://docs.google.com/spreadsheets/d/wSfAhwE293nMMFfjsnfkj23j243...'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Helpers URL */}
            <Controller
              name='helpersUrl'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor='signupUrl'>
                    Helper Responses Link
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='text'
                    placeholder='e.g. https://docs.google.com/spreadsheets/d/wSfAhwE293nMMFfjsnfkj23j243...'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
          <DialogFooter className='pt-4'>
            <Button
              type='submit'
              disabled={Boolean(isLoading || !form.formState.isValid)}
            >
              Submit
            </Button>
            <DialogClose asChild>
              <Button variant='outline'>Close</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
