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
import {
  ForgotPasswordForm,
} from './reset-password-forms';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const formSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm({ className }: { className?: string }) {
  // const [login, { isLoading }] = useLoginMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'all',
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: '/',
        rememberMe: true,
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
    <>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('flex flex-col gap-6', className)}
      >
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
              <div className='flex flex-row items-end justify-between'>
                <FieldLabel htmlFor='password'>Password</FieldLabel>
                <button
                  type='button'
                  onClick={() => setIsDialogOpen(true)}
                  className='text-muted-foreground cursor-pointer text-xs hover:underline'
                >
                  Forgot Password?
                </button>
              </div>
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
              <Loader2 className='animate-spin' /> Logging in...
            </div>
          ) : (
            'Login'
          )}
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot your password?</DialogTitle>
            <DialogDescription>
              We will send you an email shortly to verify your request.
            </DialogDescription>
          </DialogHeader>
          <ForgotPasswordForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
