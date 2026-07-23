import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';
import {
  useGetAllCoursesQuery,
  useGetPersonalDetailsQuery,
  useGetSingleUserQuery,
  useUpdateSelfMutation,
} from '../../state/user-api-slice';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Camera, Image, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router';

function UpdateSelfForm() {
  const { data } = useGetPersonalDetailsQuery();
  const [updateSelf] = useUpdateSelfMutation();

  const formSchema = z.object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
  });

  type UpdateSelfFormValues = z.infer<typeof formSchema>;

  const form = useForm<UpdateSelfFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (data?.data) {
      form.reset({
        firstName:
          data.data.userProfile?.firstName ||
          data.data.name.split(' ')[0] ||
          '',
        lastName:
          data.data.userProfile?.lastName ||
          data.data.name.split(' ').slice(1).join(' ') ||
          '',
      });
    }
  }, [data, form]);

  const onSubmit = async (data: UpdateSelfFormValues) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    // Check that at least one field is filled
    if (Object.keys(cleanedData).length === 0) {
      toast.error('Please fill in at least one field to update');
      return;
    }

    try {
      await updateSelf(cleanedData).unwrap();
      toast.success('User updated succesfully!');
    } catch (error: any) {
      toast.error('Failed to update your profile. Please try again.');
      console.error('UpdateSelfForm Error:', error);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col gap-4'
    >
      <div className='mb-2 flex w-full items-center justify-between gap-8'>
        <div
          title='Coming soon!'
          className='flex size-36 items-center justify-center rounded-full border border-dashed'
        >
          <Camera className='text-muted-foreground size-8' />
        </div>
        <div
          title='Coming soon!'
          className='flex h-30 w-135 items-center justify-center rounded-xl border border-dashed'
        >
          <p className='text-muted-foreground flex gap-2'>
            <Image /> Profile Background
          </p>
        </div>
      </div>
      <div className='flex w-full flex-row justify-between gap-4'>
        {/* First Name */}
        <Controller
          name='firstName'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='John'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Last Name */}
        <Controller
          name='lastName'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='lastName'>Last Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='Doe'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      {/* Footer */}
      {form.formState.isDirty && (
        <div className='flex w-fit gap-4 self-end'>
          <Button
            type='button'
            onClick={() => form.reset()}
            className='w-fit'
            variant={'ghost'}
            size={'sm'}
          >
            Discard changes
          </Button>
          <Button type='submit' className='w-fit' size={'sm'}>
            Save
          </Button>
        </div>
      )}
    </form>
  );
}

function UpdateSelfProfileForm() {
  const { data, isLoading } = useGetPersonalDetailsQuery();
  const { data: courseData, isLoading: isCoursesLoading } =
    useGetAllCoursesQuery();
  const [updateSelf] = useUpdateSelfMutation();

  const formSchema = z.object({
    ichat: z.string().optional(),
    adminNumber: z
      .string()
      .trim()
      .length(7, 'Admin number must have exactly 7 characters')
      .optional(),
    studentClass: z
      .string()
      .trim()
      .max(12, 'Student class can have a maximum of 12 characters only')
      .optional(),
    course: z
      .string()
      .trim()
      .max(6, 'Course can have a maximum of 6 characters only')
      .optional(),
  });

  type UpdateSelfProfileFormValues = z.infer<typeof formSchema>;

  const form = useForm<UpdateSelfProfileFormValues>({
    resolver: zodResolver(formSchema),
    // defaultValues: {
    //   adminNumber: '',
    //   studentClass: '',
    //   course: undefined,
    //   ichat: '',
    // },
    values: data?.data?.userProfile
      ? {
          adminNumber: data.data.userProfile.adminNumber ?? '',
          studentClass: data.data.userProfile.studentClass ?? '',
          course: data.data.userProfile.course ?? '',
          ichat: data.data.userProfile.ichat ?? '',
        }
      : undefined,
    resetOptions: {
      keepDefaultValues: false, // Ensures form resets cleanly when data arrives
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isLoading && !isCoursesLoading && data?.data) {
      form.reset({
        adminNumber: data.data.userProfile?.adminNumber ?? '',
        studentClass: data.data.userProfile?.studentClass ?? '',
        course: data.data.userProfile?.course ?? '',
        ichat: data.data.userProfile?.ichat ?? '',
      });
    }
  }, [data, form, isCoursesLoading]);

  const onSubmit = async (data: UpdateSelfProfileFormValues) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    // Check that at least one field is filled
    if (Object.keys(cleanedData).length === 0) {
      toast.error('Please fill in at least one field to update');
      return;
    }

    try {
      await updateSelf(cleanedData).unwrap();
      toast.success('User updated succesfully!');
    } catch (error: any) {
      toast.error('Failed to update your profile. Please try again.');
      console.error('UpdateSelfForm Error:', error);
    }
  };

  if (!isLoading && !data?.data.userProfile) {
    return (
      <div className='flex flex-row items-center gap-8 rounded-md border border-amber-400 bg-amber-300/10 px-3 py-2'>
        <div className='flex flex-col gap-1'>
          <h1 className='flex items-center gap-2'>
            <AlertTriangle className='size-4' />
            Profile not linked
          </h1>
          <p className='text-sm'>
            Your account is not yet linked to your academic details. Please link
            your profile first to unlock more features and statistics.
          </p>
        </div>
        <Button variant={'secondary'} asChild>
          <Link to={'/link-profile'}>
            <Link2 /> Link Account
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col gap-4'
    >
      <div className='flex w-full flex-row justify-between gap-4'>
        <Controller
          name='ichat'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='ichat'>iChat Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='example@ichat.sp.edu.sg'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
                // Only enable once update verification is ready
                disabled
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name='adminNumber'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='adminNumber'>Admin Number</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='1234567'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      <div className='flex w-full flex-row justify-between gap-4'>
        {/* Student Class */}
        <Controller
          name='studentClass'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor='studentClass'>Class</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type='text'
                placeholder='1234567'
                autoComplete='off'
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {/* Course */}
        <Controller
          name='course'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation={'responsive'} data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor='course'>Course</FieldLabel>
              </FieldContent>
              <Select
                name={field.name}
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger id='course'>
                  <SelectValue placeholder='Select a course' />
                </SelectTrigger>
                <SelectContent position='item-aligned'>
                  {!isCoursesLoading &&
                    courseData?.data.map((course) => (
                      <SelectItem
                        key={course.code}
                        value={course.code}
                        title={course.name}
                      >
                        {course.code}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
      {/* Footer */}
      {form.formState.isDirty && (
        <div className='flex w-fit gap-4 self-end'>
          <Button
            type='button'
            onClick={() => form.reset()}
            className='w-fit'
            variant={'ghost'}
            size={'sm'}
          >
            Discard changes
          </Button>
          <Button
            type='submit'
            className='w-fit'
            size={'sm'}
            disabled={!form.formState.isValid}
          >
            Save
          </Button>
        </div>
      )}
    </form>
  );
}

export function ProfileSettings() {
  return (
    <div>
      <h1 className='text-2xl'>Public Profile</h1>
      <Separator className='my-2' />
      {/* TODO: Show notification if user has not linked profile yet */}
      <div className='mb-2 flex flex-col gap-2 py-2'>
        <UpdateSelfForm />
        <h1 className='my-1 text-xl'>Socials</h1>
        <div className='text-muted-foreground flex w-full items-center justify-center rounded-md border border-dashed p-6'>
          <h1>Coming soon...</h1>
        </div>
      </div>
      <h1 className='text-2xl'>Personal Information</h1>
      <p className='text-muted-foreground text-sm'>
        Your personal information is hidden from the public, only visible to
        you.
      </p>
      <Separator className='my-2' />
      <div className='mb-2 flex flex-col gap-2 py-2'>
        <UpdateSelfProfileForm />
      </div>
    </div>
  );
}
