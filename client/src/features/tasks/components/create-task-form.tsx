import { cn } from '@/lib/utils';
import { Plus, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import * as z from 'zod';
import { TaskPriorityEnum, TaskStatusEnum } from '../tasks.dto';
import { Button } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Kbd } from '@/components/ui/kbd';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function CreateTaskForm({ className }: { className?: string }) {
  const formSchema = z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title has a maximum of 100 characters'),
    description: z.string().optional(),
    assigneeId: z.string().optional(),
    status: z
      .enum([
        TaskStatusEnum.NOT_STARTED,
        TaskStatusEnum.IN_PROGRESS,
        TaskStatusEnum.COMPLETED,
      ])
      .optional(),
    priority: z
      .enum([
        TaskPriorityEnum.LOW,
        TaskPriorityEnum.MEDIUM,
        TaskPriorityEnum.HIGH,
      ])
      .optional(),
    departmentId: z.number().optional(),
    // deadline: z.coerce.date().optional(),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: FormValues) => {};

  const [isFocused, setIsFocused] = useState(false);

  if (isFocused) {
    return (
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'border-muted flex w-full flex-col gap-1 rounded-md border px-3 py-2',
          className,
        )}
      >
        <div className={'flex w-full flex-row items-center gap-2'}>
          <Controller
            name='title'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                {/* <FieldLabel htmlFor='firstName'>First Name</FieldLabel> */}
                <input
                  {...field}
                  id='title'
                  type='text'
                  placeholder='Task title'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  className='outline-0'
                  required
                />

                {/* {fieldState.invalid && (
                  <FieldError
                    data-testid='login-firstname-errors'
                    errors={[fieldState.error]}
                  />
                )} */}
              </Field>
            )}
          />
        </div>
        <div className='flex flex-row justify-end gap-2'>
          {/* <p className='text-muted-foreground font-mono text-xs'>
            Press enter to save.
          </p> */}
          <Button
            onClick={() => setIsFocused(false)}
            size={'sm'}
            variant={'secondary'}
          >
            Cancel
          </Button>
          <Button type='submit' size={'sm'}>
            Add task
          </Button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsFocused(true)}
      className='hover:text-primary text-muted-foreground flex cursor-pointer flex-row items-center gap-1 text-left text-sm font-medium'
    >
      <PlusCircle className='size-4' />
      Add Task
    </button>
  );
}
