import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Post } from '../forum.dto';
import { useUpdatePostMutation } from '../state/forum-api-slice';

// Mirrors the server's UpdatePostSchema so the two agree on what is valid.
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

type EditPostFormValues = z.infer<typeof formSchema>;

export function EditPostDialog({
  post,
  open,
  onOpenChange,
}: {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [updatePost, { isLoading }] = useUpdatePostMutation();

  const form = useForm<EditPostFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { title: post.title, content: post.content },
  });

  // Reopening on a post that changed underneath us should show the new text.
  useEffect(() => {
    if (open) {
      form.reset({ title: post.title, content: post.content });
    }
  }, [open, post.title, post.content, form]);

  const onSubmit = async (values: EditPostFormValues) => {
    try {
      const { message } = await updatePost({
        postId: post.postId,
        ...values,
      }).unwrap();

      toast.success(message);
      onOpenChange(false);
    } catch (error: any) {
      console.error('EditPostDialog Error:', error);
      toast.error(error?.data?.message ?? 'Could not save your changes');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-4'
        >
          <Controller
            name='title'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type='text'
                  autoComplete='off'
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name='content'
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Body</FieldLabel>
                <Textarea
                  {...field}
                  id={field.name}
                  rows={8}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={Boolean(isLoading || !form.formState.isValid)}
            >
              {isLoading ? (
                <>
                  <Loader2 className='animate-spin' /> Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
