import { NavBar } from '@/components/navigation/navbar';
import { Outlet } from 'react-router';

// This will be the root layout of the publicly viewable site
export default function SiteLayout() {
  return (
    <div className='flex h-screen min-h-screen w-full flex-col px-6 py-4'>
      <NavBar />
      <Outlet />
    </div>
  );
}
