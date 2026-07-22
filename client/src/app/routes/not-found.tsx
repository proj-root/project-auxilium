import { Button } from '@/components/ui/button';
import { House } from 'lucide-react';
import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6'>
      <div className='flex flex-col items-center gap-1'>
        <h1 className='text-8xl font-semibold'>404</h1>
        <img src='/not-found.png' className='max-w-sm' />
        <h1 className='text-3xl mt-4'>Page Not Found</h1>
        <p className='text-muted-foreground text-center'>
          How on earth did you get here?? <br />
          (it could've been my fault actually mb)
        </p>
      </div>
      <Button variant={'outline'} asChild>
        <Link to={'/'}>
          <House /> Home
        </Link>
      </Button>
    </div>
  );
}
