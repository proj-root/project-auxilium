import * as z from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLoginMutation } from '../state/auth-api-slice';
import { useAppDispatch } from '@/hooks/redux-hooks';
import {
  setAccessToken,
  setAuthLoading,
  setRoleId,
  setUserId,
} from '../state/auth-slice';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.email({ message: 'Invalid email address' }),
  password: z.string(),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginForm({ className }: { className?: string }) {
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'all',
  });

  const onSubmit = async (data: LoginFormValues) => {
    // console.log('LoginForm:onSubmit - starting login with email=', data.email);
    try {
      const responseData = await login(data).unwrap();
      const accessToken = responseData.data.accessToken ?? null;
      
      dispatch(setAuthLoading(true));
      dispatch(setAccessToken(accessToken));
  
      const payload: { userId: string; roleId: number } =
        await jwtDecode(accessToken);
  
      dispatch(setRoleId(payload.roleId));
      dispatch(setUserId(payload.userId));

      navigate('/admin', { flushSync: true });
    } catch (error) {
      console.error('LoginForm Error:', error);
      toast.error('Invalid login credentials');
    } finally {
      dispatch(setAuthLoading(false));
      return;
    }
  };

  return (
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
              <Link
                to={'/'}
                className='text-muted-foreground text-xs hover:underline'
              >
                Forgot Password?
              </Link>
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
  );
}
