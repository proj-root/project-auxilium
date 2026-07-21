import * as z from 'zod';
import type { UserProfileDTO } from '../user.dto';
import { cn } from '@/lib/utils';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  useGetAllCoursesQuery,
  useGetSingleUserQuery,
  useUpdateUserByIdMutation,
  useUpdateUserProfileByIdMutation,
} from '../state/user-api-slice';
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useEffect } from 'react';

const formSchema = z.object({
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  ichat: z.email().optional(),
  adminNumber: z
    .string()
    .trim()
    .max(7, 'Admin number can have a maximum of 7 characters only')
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

type EditUserProfileFormValues = z.infer<typeof formSchema>;

interface EditUserProfileFormProps {
  profileId: string;
  onSubmitCb: () => void;
  className?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditUserProfileModal({
  profileId,
  onSubmitCb,
  className,
  children,
  open,
  onOpenChange,
}: EditUserProfileFormProps) {
  const [updateUserProfile, { isLoading }] = useUpdateUserProfileByIdMutation();
  const { data: profileData } = useGetSingleUserQuery({
    userProfileId: profileId,
  });
  const { data: courseData } = useGetAllCoursesQuery();

  const form = useForm<EditUserProfileFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: {
      firstName: '',
      lastName: '',
      ichat: '',
      adminNumber: '',
      studentClass: '',
      course: '',
    },
  });

  useEffect(() => {
    if (profileData?.data) {
      form.reset({
        firstName: profileData.data.firstName || '',
        lastName: profileData.data.lastName || '',
        ichat: profileData.data.ichat || '',
        adminNumber: profileData.data.adminNumber || '',
        studentClass: profileData.data.studentClass || '',
        course: profileData.data.course || '',
      });
    }
  }, [profileData, form]);

  const dirtyFieldsCount = Object.keys(form.formState.dirtyFields).length;

  const onSubmit = async (data: EditUserProfileFormValues) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    // Check that at least one field is filled
    if (Object.keys(cleanedData).length === 0) {
      toast.error('Please fill in at least one field to update');
      return;
    }

    try {
      await updateUserProfile({
        profileId,
        ...cleanedData,
      }).unwrap();
      toast.success('User profile updated succesfully!');
    } catch (error: any) {
      console.error('EditUserProfileForm Error:', error);
      toast.error(error.data.message);
    } finally {
      onSubmitCb();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Define whether opening state is handled internally or externally */}
      {children && <DialogTrigger>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editing user profile</DialogTitle>
          {dirtyFieldsCount > 0 && (
            <DialogDescription>
              {dirtyFieldsCount} change(s) have been made. Please remember to{' '}
              <strong>save</strong>!
            </DialogDescription>
          )}
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('flex flex-col gap-4', className)}
        >
          <div className='flex w-full flex-row justify-between gap-2'>
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          {/* iChat email */}
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
                  placeholder='example@ichat.edu.sp.sg'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Admin Number */}
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Class */}
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
                  placeholder='DIT/FT/1A/02'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Course */}
          <Controller
            name='course'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                orientation={'responsive'}
                data-invalid={fieldState.invalid}
              >
                <FieldContent>
                  <FieldLabel htmlFor='course'>Course</FieldLabel>
                </FieldContent>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id='course'>
                    <SelectValue placeholder='Select a course' />
                  </SelectTrigger>
                  <SelectContent position='item-aligned'>
                    {courseData?.data.map((course) => (
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
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <DialogFooter>
            <Button
              type='submit'
              disabled={Boolean(
                isLoading || !form.formState.isValid || !form.formState.isDirty,
              )}
            >
              {isLoading ? (
                <p className='fle gap-2'>
                  <Loader2 className='size-4 animate-spin' /> Saving...
                </p>
              ) : (
                'Save changes'
              )}
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
