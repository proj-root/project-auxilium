import { cn } from '@/lib/utils';
import { Bolt, Flag, Plus, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import * as z from 'zod';
import { TaskPriorityEnum, TaskStatusEnum } from '../tasks.dto';
import { Button } from '@/components/ui/button';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Kbd } from '@/components/ui/kbd';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useGetAllDepartmentsQuery } from '@/features/user/state/user-api-slice';
import { useCreateTaskMutation } from '../state/tasks-api-slice';
import { toast } from 'sonner';

export function CreateTaskForm({
  eventId,
  className,
}: {
  eventId: string;
  className?: string;
}) {
  // Fetch relevant data
  const { data } = useGetAllDepartmentsQuery();
  const [createTask] = useCreateTaskMutation();

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
    departmentId: z.string().optional(),
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

  const onSubmit = async (data: FormValues) => {
    console.log(data);
    try {
      const { message } = await createTask({ eventId, ...data }).unwrap();
      toast.success(message);
    } catch (error: any) {
      console.log(error.data.message);
      toast.error(error.data.message);
    }
  };

  const [isFocused, setIsFocused] = useState(false);

  if (isFocused) {
    return (
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          'border-muted flex w-full flex-col gap-2 rounded-md border py-2',
          className,
        )}
      >
        <div className={'flex w-full flex-col items-center gap-0.5 px-3'}>
          {/* Title */}
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
                  className='font-medium outline-0'
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
          {/* Description */}
          <Controller
            name='description'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                {/* <FieldLabel htmlFor='firstName'>First Name</FieldLabel> */}
                <input
                  {...field}
                  id='description'
                  type='text'
                  placeholder='Description...'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  className='text-sm outline-0'
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

        <div className='flex flex-row gap-2 px-3'>
          <Controller
            name='priority'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='w-fit'>
                <Select
                  name='priority'
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    size='sm'
                    className='max-w-32.5'
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={
                        <p className='flex flex-row items-center gap-1'>
                          <Flag />
                          Priority
                        </p>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position='item-aligned'>
                    <SelectItem value={TaskPriorityEnum.HIGH}>
                      <Flag className='text-red-400' />
                      High
                    </SelectItem>
                    <SelectItem value={TaskPriorityEnum.MEDIUM}>
                      <Flag className='text-yellow-400' />
                      Medium
                    </SelectItem>
                    <SelectItem value={TaskPriorityEnum.LOW}>
                      <Flag className='text-green-400' />
                      Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name='departmentId'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className='w-fit'>
                <Select
                  name='departmentId'
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    size='sm'
                    className='max-w-42.5'
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={
                        <p className='flex flex-row items-center gap-1'>
                          <Bolt />
                          Department
                        </p>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent position='item-aligned'>
                    <SelectGroup>
                      {data?.data &&
                        data.data.map((dept) => (
                          <SelectItem
                            key={dept.departmentId}
                            value={dept.departmentId.toString()}
                          >
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <Separator className='my-1' />

        <div className='flex flex-row justify-end gap-2 px-3'>
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
