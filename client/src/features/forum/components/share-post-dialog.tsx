import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { copyToClipboard } from '@/lib/clipboard';
import { Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Hands the reader a link to one post. The URL is built after mount because
 * the app renders on the server, where there is no window.
 */
export function SharePostDialog({
  postId,
  open,
  onOpenChange,
}: {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (!open) return;

    setUrl(`${window.location.origin}/forum/${postId}`);
  }, [open, postId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Share this post</DialogTitle>
          <DialogDescription>
            Anyone with this link can read the post, signed in or not.
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-row items-center gap-2'>
          <Input
            readOnly
            value={url}
            aria-label='Link to this post'
            onFocus={(event) => event.currentTarget.select()}
            className='font-mono text-xs'
          />
          <Button
            variant='secondary'
            onClick={() => copyToClipboard(url)}
            disabled={!url}
          >
            <Copy /> Copy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
