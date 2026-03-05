import * as z from 'zod';
import {
  useCreateEventMutation,
  useGetAllEventTypesQuery,
} from '../state/events-api-slice';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

export function DatePickerTime() {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <FieldGroup className='mx-auto max-w-xs flex-row'>
      <Field>
        <FieldLabel htmlFor='date-picker-optional'>Date</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date-picker-optional'
              className='w-32 justify-between font-normal'
            >
              {date ? format(date, 'PPP') : 'Select date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={date}
              captionLayout='dropdown'
              defaultMonth={date}
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
      <Field className='w-32'>
        <FieldLabel htmlFor='time-picker-optional'>Time</FieldLabel>
        <Input
          type='time'
          id='time-picker-optional'
          step='1'
          defaultValue='10:30:00'
          className='bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none'
        />
      </Field>
    </FieldGroup>
  );
}

const formSchema = z.object({
  name: z.string({ error: 'This field is required' }),
  description: z.string({ error: 'This field is required' }),
  eventTypeId: z.string({ error: 'This field is required' }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  platform: z.string().optional(),
  signupUrl: z.string().optional(),
  feedbackUrl: z.string().optional(),
  helpersUrl: z.string().optional(),
});

type CreateEventFormValues = z.infer<typeof formSchema>;

export function CreateEventForm({ className }: { className?: string }) {
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const { data: eventTypes } = useGetAllEventTypesQuery();

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'all',
  });

  const onSubmit = async (data: CreateEventFormValues) => {
    try {
      await createEvent(data).unwrap();
      toast.success('Event created succesfully!');
    } catch (error: any) {
      console.error('CreateEventForm Error:', error);
      toast.error(error.data.message);
    } finally {
      return;
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn(
        'flex grid h-fit w-full grid-cols-2 grid-rows-1 gap-4',
        className,
      )}
    >
      <div className='col-span-1 flex w-full flex-col gap-4'>
        {/* Event Name */}
        <Controller
          name='name'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='name'>Event Name</FieldLabel>
              <FieldDescription>A cool event name!</FieldDescription>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='How To...'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                required
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Event Type */}
        <Controller
          name='eventTypeId'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation={'responsive'} data-invalid={fieldState.invalid}>
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Platform */}
        <Controller
          name='platform'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation={'responsive'} data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor='platform'>Platform</FieldLabel>
                <FieldDescription>
                  What platform will the event be hosted on?
                </FieldDescription>
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
        {/* TODO: Make these reusable components */}
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
                  <FieldLabel htmlFor='startDate'>Start Date & Time</FieldLabel>
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
      </div>

      <div className='col-start-2 flex w-full flex-col gap-4'>
        {/* Signup URL */}
        <Controller
          name='signupUrl'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='signupUrl'>Signup Responses Link</FieldLabel>
              <FieldDescription>
                Google Sheets URL to Form Responses for Sign Ups (optional)
              </FieldDescription>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='e.g. https://docs.google.com/spreadsheets/d/wSfAhwE293nMMFfjsnfkj23j243...'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              <FieldDescription>
                Google Sheets URL to Form Responses for Feedback (optional)
              </FieldDescription>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='e.g. https://docs.google.com/spreadsheets/d/wSfAhwE293nMMFfjsnfkj23j243...'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Helpers URL */}
        <Controller
          name='helpersUrl'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='signupUrl'>Helper Responses Link</FieldLabel>
              <FieldDescription>
                Google Sheets URL to Form Responses for Helpers (optional)
              </FieldDescription>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='e.g. https://docs.google.com/spreadsheets/d/wSfAhwE293nMMFfjsnfkj23j243...'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className='flex flex-col'>
        <Button
          type='submit'
          size={'sm'}
          disabled={Boolean(isLoading || !form.formState.isValid)}
          className='w-fit'
        >
          {isLoading ? (
            <div className='flex flex-row items-center gap-2'>
              <Loader2 className='animate-spin' /> Creating event...
            </div>
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </form>
  );
}
