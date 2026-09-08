import { SiteFooter } from '@/components/navigation/footer';
import { NavBar } from '@/components/navigation/navbar';
import { Outlet } from 'react-router';

// This will be the root layout of the publicly viewable site
export default function SiteLayout() {
  return (
    <div className='flex h-screen min-h-screen w-full scrollbar-none flex-col overflow-auto'>
      <NavBar />
      {/*
        min-h-full + shrink-0 rather than h-full: a fixed height caps this box
        at the viewport, and a page longer than that (the forum feed) spills
        out of it and lands under the footer. shrink-0 stops flex compressing
        it back down. justify-start for the same reason — centring pushes the
        top of a long page out of reach.
      */}
      <div className='flex min-h-full shrink-0 flex-col items-center justify-start px-6 py-4'>
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
