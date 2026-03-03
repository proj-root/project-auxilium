import { NavBar } from '@/components/navigation/navbar';

export default function Home() {
  return (
    <div className='flex h-screen min-h-screen w-full flex-col px-6 py-4'>
      <NavBar />
      <div className='flex h-full flex-col items-center justify-center'>
        <h1 className='text-xl'>Welcome to SEED's G.A.R.D.E.N. Terminal.</h1>
        <p>Generic Administrative Repository and Distributed Events Network</p>
      </div>
    </div>
  );
}
