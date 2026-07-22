import { Button } from '@/components/ui/button';
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeClosed, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import z from 'zod';

export function ResetPasswordForm({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const formSchema = z
    .object({
      password: z
        .string()
        .min(8, { error: 'Password should be at least 8 characters.' }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      error: 'Passwords do not match',
      path: ['confirmPassword'],
    });

  type ResetPasswordFormValues = z.infer<typeof formSchema>;

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });
      if (error) {
        toast.error('Failed to reset password, please try again.');
        console.error('ResetPasswordError:', error);
      } else {
        toast.success('Password reset successfully!');
        navigate('/auth/login');
      }
    } catch (error) {
      console.error('ResetPasswordError:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col gap-4'
    >
      <Controller
        name='password'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='password'>Password</FieldLabel>
            <div className='flex items-center gap-2'>
              <Input
                {...field}
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='New Password'
                autoComplete='on'
                aria-invalid={fieldState.invalid}
                required
              />
              <Button
                onClick={() => setShowPassword(!showPassword)}
                type='button'
                variant={'ghost'}
                size={'icon-sm'}
              >
                {!showPassword ? <Eye /> : <EyeClosed />}
              </Button>
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name='confirmPassword'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='confirmPassword'>Confirm Password</FieldLabel>
            <Input
              {...field}
              id='confirmPassword'
              type='password'
              placeholder='Confirm Password'
              autoComplete='on'
              aria-invalid={fieldState.invalid}
              required
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        type='submit'
        className='mt-2'
        disabled={isLoading || !form.formState.isValid}
      >
        {!isLoading ? (
          'Reset Password'
        ) : (
          <p className='flex items-center gap-2'>
            <Loader2 className='size-4 animate-spin' />
            Loading...
          </p>
        )}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    email: z.email(),
  });

  type ForgotPasswordFormValues = z.infer<typeof formSchema>;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
      });

      if (error) {
        toast.error('Failed to reset password, please try again.');
        console.error('ResetPasswordError:', error);
      } else {
        toast.success(
          'If your email is registered in our system, a password reset request should arrive in your inbox shortly.',
        );
      }
    } catch (error) {
      console.error('ResetPasswordError:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='flex flex-col gap-4'
    >
      <Controller
        name='email'
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='email'>Enter your email</FieldLabel>
            <Input
              {...field}
              id='email'
              type='text'
              placeholder='example@gmail.com'
              autoComplete='on'
              aria-invalid={fieldState.invalid}
              required
            />
            <FieldDescription className='text-xs'>
              Note: Please use the email you registered with. It may/may not be
              your ichat email.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        type='submit'
        disabled={Boolean(isLoading || !form.formState.isValid)}
        className='w-fit cursor-pointer self-end'
      >
        {isLoading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='animate-spin' /> Loading...
          </div>
        ) : (
          'Verify Email'
        )}
      </Button>
    </form>
  );
}
