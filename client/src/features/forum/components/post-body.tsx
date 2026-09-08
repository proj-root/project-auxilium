import { cn } from '@/lib/utils';

// Posts and comments are plain text. Bare links are the one thing worth
// promoting, and splitting on a capture group keeps the rest of the text inert.
const SPLIT_ON_URL = /(https?:\/\/[^\s]+)/g;
const IS_URL = /^https?:\/\//;

export function PostBody({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'text-sm/relaxed break-words whitespace-pre-wrap',
        className,
      )}
    >
      {text.split(SPLIT_ON_URL).map((chunk, index) =>
        IS_URL.test(chunk) ? (
          <a
            key={index}
            href={chunk}
            target='_blank'
            rel='noopener noreferrer'
            className='text-primary underline underline-offset-4'
            onClick={(event) => event.stopPropagation()}
          >
            {chunk}
          </a>
        ) : (
          chunk
        ),
      )}
    </p>
  );
}
