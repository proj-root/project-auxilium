import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/hooks/redux-hooks';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import {
  useCompleteProfileLinkMutation,
  useVerifyIdentityMutation,
} from '../state/auth-api-slice';
import {
  selectLinkProfileState,
  setIChat,
  setProfileExists,
  setStep,
} from '../state/link-profile-slice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function VerifyIdentityForm({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const [verifyIdentity, { isLoading }] = useVerifyIdentityMutation();

  const formSchema = z.object({
    ichat: z.email().min(1, { message: 'iChat is required' }),
  });

  type VerifyIdentityFormValues = z.infer<typeof formSchema>;

  const form = useForm<VerifyIdentityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ichat: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: VerifyIdentityFormValues) => {
    try {
      const {
        data: { profileExists },
      } = await verifyIdentity({ ichat: data.ichat }).unwrap();

      dispatch(setIChat(data.ichat));
      dispatch(setProfileExists(profileExists));
      dispatch(setStep(2));
    } catch (error: any) {
      toast.error(error.data.message);
      console.error('CredentialLoginError:', error);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-6', className)}
    >
      <Controller
        name='ichat'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='ichat'>iChat Email</FieldLabel>
            <Input
              {...field}
              id='ichat'
              type='email'
              placeholder='example@ichat.sp.edu.sg'
              autoComplete='on'
              aria-invalid={fieldState.invalid}
              data-testid='login-ichat'
            />
            {fieldState.invalid && (
              <FieldError
                data-testid='login-ichat-errors'
                errors={[fieldState.error]}
              />
            )}
          </Field>
        )}
      />

      <Button
        type='submit'
        disabled={Boolean(isLoading || !form.formState.isValid)}
        className='w-fit cursor-pointer self-center px-8'
        data-testid='login-submit'
      >
        {isLoading ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' /> Sending OTP...
          </div>
        ) : (
          'Send OTP'
        )}
      </Button>
    </form>
  );
}

export function CompleteProfileLinkForm({ className }: { className?: string }) {
  const { profileExists, ichat } = useAppSelector(selectLinkProfileState);
  const dispatch = useAppDispatch();
  const [completeProfileLink, { isLoading }] = useCompleteProfileLinkMutation();

  const baseFormSchema = z.object({
    hasProfile: z.literal(true),
    otp: z.string().length(6, { message: 'OTP must be 6 characters long' }),
  });

  const detailsFormSchema = z.object({
    hasProfile: z.literal(false),
    otp: z.string().length(6, { message: 'OTP must be 6 characters long' }),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    course: z.string().min(1, { message: 'Course is required' }),
    studentClass: z.string().min(1, { message: 'Class is required' }),
    adminNumber: z.string().length(7, {
      message: 'Admin number must be 7 characters long. (Omit the "P")',
    }),
  });

  const formSchema = z.discriminatedUnion('hasProfile', [
    baseFormSchema,
    detailsFormSchema,
  ]);

  type CompleteProfileFormValues = z.infer<typeof formSchema>;

  const form = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hasProfile: profileExists,
      otp: '',
      firstName: '',
      lastName: '',
      course: '',
      studentClass: '',
      adminNumber: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: CompleteProfileFormValues) => {
    try {
      await completeProfileLink({ ...data }).unwrap();

      // dispatch(setIChat(undefined));
      // dispatch(setProfileExists(false));
      dispatch(setStep(3));
    } catch (error: any) {
      toast.error(error.data.message);
      console.error('CredentialLoginError:', error);
    }
  };

  // TODO
  // Implement retry logic in case otp expires
  const retryOTP = async () => {
    
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-6', className)}
    >
      {!profileExists && (
        <div className='flex flex-col gap-6'>
          <div className='flex flex-row gap-4'>
            <Controller
              name='firstName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='firstName'>First Name</FieldLabel>
                  <Input
                    {...field}
                    id='firstName'
                    type='text'
                    placeholder='John'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                    data-testid='link-profile-firstname'
                  />
                  {fieldState.invalid && (
                    <FieldError
                      data-testid='link-profile-firstname-errors'
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name='lastName'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='lastName'>Last Name</FieldLabel>
                  <Input
                    {...field}
                    id='lastName'
                    type='text'
                    placeholder='Doe'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                    data-testid='link-profile-lastname'
                  />
                  {fieldState.invalid && (
                    <FieldError
                      data-testid='link-profile-lastname-errors'
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name='adminNumber'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='adminNumber'>Admin Number</FieldLabel>
                <Input
                  {...field}
                  id='adminNumber'
                  type='text'
                  placeholder='e.g. 1234567'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  data-testid='link-profile-adminnumber'
                />
                {fieldState.invalid && (
                  <FieldError
                    data-testid='link-profile-adminnumber-errors'
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name='studentClass'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='studentClass'>Class</FieldLabel>
                <Input
                  {...field}
                  id='studentClass'
                  type='text'
                  placeholder='e.g. DCS/FT/1A/01'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                  data-testid='link-profile-studentclass'
                />
                {fieldState.invalid && (
                  <FieldError
                    data-testid='link-profile-studentclass-errors'
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <FieldGroup>
            <Controller
              name='course'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <FieldLabel htmlFor='course'>Course</FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id='course'>
                      <SelectValue placeholder='Select' />
                    </SelectTrigger>
                    {/* TODO: Make a route to fetch this data */}
                    <SelectContent position='item-aligned'>
                      <SelectItem value='DIT'>DIT</SelectItem>
                      <SelectItem value='DCS'>DCS</SelectItem>
                      <SelectItem value='DCDF'>DCDF</SelectItem>
                      <SelectItem value='DAAA'>DAAA</SelectItem>
                      <SelectItem value='DCITP'>DCITP</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </div>
      )}

      <Controller
        name='otp'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <div className='flex flex-row items-end justify-between'>
              <FieldLabel htmlFor='otp'>OTP</FieldLabel>
              <p className='text-muted-foreground cursor-pointer text-xs hover:underline'>
                Resend OTP
              </p>
            </div>
            <Input
              {...field}
              id='otp'
              type='text'
              placeholder='Enter 6-digit OTP'
              autoComplete='off'
              aria-invalid={fieldState.invalid}
              data-testid='login-otp'
            />
            {fieldState.invalid && (
              <FieldError
                data-testid='link-profile-otp-errors'
                errors={[fieldState.error]}
              />
            )}
          </Field>
        )}
      />

      <Button
        type='submit'
        disabled={Boolean(isLoading || !form.formState.isValid)}
        className='w-fit cursor-pointer self-center px-8'
        data-testid='login-submit'
      >
        {isLoading ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' /> Sending OTP...
          </div>
        ) : (
          'Complete Profile'
        )}
      </Button>
    </form>
  );
}
