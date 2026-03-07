import { useNavigate } from 'react-router';
import { Button } from '../ui/button';

export function BackButton({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <Button
      className='w-fit px-1 h-6 text-muted-foreground'
      size={'sm'}
      variant={'link'}
      onClick={() => navigate(-1)}
    >
      {children || <>🡨&nbsp; Back</>}
    </Button>
  );
}
