import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';

const formSchema = z.object({
  firstName: z
    .string()
    .min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z
    .string()
    .min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.email({ message: 'Invalid email address' }),
  password: z.string(),
  // TODO: Add secure password checking next time
});

type RegisterFormValues = z.infer<typeof formSchema>;

export function RegisterForm({ className }: { className?: string }) {
  // const [login, { isLoading }] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: data.firstName + ' ' + data.lastName,
        email: data.email,
        password: data.password,
        callbackURL: '/',
      });

      if (error) {
        toast.error(error.message);
        console.error('CredentialLoginError:', error);
      }
    } catch (error) {
      console.error('CredentialLoginError:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-6', className)}
    >
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
                autoComplete='on'
                aria-invalid={fieldState.invalid}
                data-testid='login-firstName'
              />
              {fieldState.invalid && (
                <FieldError
                  data-testid='login-firstname-errors'
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
                autoComplete='on'
                aria-invalid={fieldState.invalid}
                data-testid='login-lastName'
              />
              {fieldState.invalid && (
                <FieldError
                  data-testid='login-lastName-errors'
                  errors={[fieldState.error]}
                />
              )}
            </Field>
          )}
        />
      </div>

      <Controller
        name='email'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='email'>Email</FieldLabel>
            <Input
              {...field}
              id='email'
              type='email'
              placeholder='example@mail.com'
              autoComplete='on'
              aria-invalid={fieldState.invalid}
              data-testid='login-email'
            />
            {fieldState.invalid && (
              <FieldError
                data-testid='login-email-errors'
                errors={[fieldState.error]}
              />
            )}
          </Field>
        )}
      />

      <Controller
        name='password'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='password'>Password</FieldLabel>
            <Input
              {...field}
              id='password'
              type='password'
              placeholder='Enter your password'
              autoComplete='on'
              aria-invalid={fieldState.invalid}
              data-testid='login-password'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            {/* <p className='text-muted-foreground text-xs'>
              • Contains at least 8-12 characters <br/>
              • Contains at least 1 uppercase character <br/>
              • Contains at least 1 digit
            </p> */}
          </Field>
        )}
      />

      <Button
        type='submit'
        disabled={Boolean(isLoading || !form.formState.isValid)}
        className='w-full cursor-pointer'
        data-testid='login-submit'
      >
        {isLoading ? (
          <div className='flex flex-row items-center gap-2'>
            <Loader2 className='animate-spin' /> Registering...
          </div>
        ) : (
          'Register'
        )}
      </Button>
    </form>
  );
}
