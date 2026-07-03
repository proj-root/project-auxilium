import { Button } from "@/components/ui/button";
import { House } from "lucide-react";
import { Link } from "react-router";

export default function UnauthorizedPage() {
  return (
    <div className='flex h-full flex-col items-center justify-center gap-6'>
      <div className='flex flex-col items-center gap-1'>
        <h1 className='text-3xl'>Unauthorized</h1>
        <p className='text-muted-foreground text-center'>
          You do not have permission to access this page. <br />
          Please contact an administrator if you believe this is an error.
        </p>
      </div>
      <img src='/unauthorized.png' className='max-w-sm' />
      <Button variant={'outline'} asChild>
        <Link to={'/'}><House /> Home</Link>
      </Button>
    </div>
  );
}
