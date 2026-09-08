import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, PenLine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForumSession } from '../hooks/use-forum-session';
import { useCreatePostMutation } from '../state/forum-api-slice';

const formSchema = z.object({
  title: z
    .string({ error: 'A title is required' })
    .trim()
    .min(1, 'A title is required')
    .max(150, 'Titles are limited to 150 characters'),
  content: z
    .string({ error: 'Write something first' })
    .trim()
    .min(1, 'Write something first'),
});

type PostComposerValues = z.infer<typeof formSchema>;

/**
 * Writing a post never leaves the feed. Collapsed it is a single line; opening
 * it expands the same surface in place into title and body.
 */
export function PostComposer({ className }: { className?: string }) {
  const { requireAuth } = useForumSession();
  const [isOpen, setIsOpen] = useState(false);
  const [createPost, { isLoading }] = useCreatePostMutation();

  const form = useForm<PostComposerValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { title: '', content: '' },
  });

  useEffect(() => {
    if (form.formState.isSubmitSuccessful) {
      form.reset();
    }
  }, [form.formState.isSubmitSuccessful, form]);

  const onSubmit = async (values: PostComposerValues) => {
    try {
      const { message } = await createPost(values).unwrap();

      toast.success(message);
      setIsOpen(false);
    } catch (error: any) {
      console.error('PostComposer Error:', error);
      toast.error(error?.data?.message ?? 'Could not publish your post');
    }
  };

  if (!isOpen) {
    return (
      <button
        type='button'
        onClick={() => {
          if (requireAuth()) setIsOpen(true);
        }}
        className={cn(
          'text-muted-foreground hover:border-ring hover:text-foreground flex w-full flex-row items-center gap-2 rounded-md border px-4 py-3 text-left text-sm transition-colors',
          className,
        )}
      >
        <PenLine className='size-4' />
        Share something with the garden
      </button>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn(
        'flex w-full flex-col gap-2 rounded-md border py-2',
        className,
      )}
    >
      <Controller
        name='title'
        control={form.control}
        render={({ field }) => (
          <input
            {...field}
            autoFocus
            type='text'
            maxLength={150}
            placeholder='Title'
            autoComplete='off'
            aria-label='Post title'
            className='px-4 text-base font-semibold outline-0'
          />
        )}
      />
      <Controller
        name='content'
        control={form.control}
        render={({ field }) => (
          <textarea
            {...field}
            rows={4}
            placeholder='What do you want to say?'
            aria-label='Post body'
            className='resize-none px-4 text-sm/relaxed outline-0'
          />
        )}
      />
      <Separator className='my-1' />
      <div className='flex flex-row justify-end gap-2 px-3'>
        <Button
          type='button'
          size='sm'
          variant='secondary'
          onClick={() => {
            setIsOpen(false);
            form.reset();
          }}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          size='sm'
          disabled={Boolean(isLoading || !form.formState.isValid)}
        >
          {isLoading ? (
            <>
              <Loader2 className='animate-spin' /> Posting...
            </>
          ) : (
            'Post'
          )}
        </Button>
      </div>
    </form>
  );
}
