import { Outlet } from 'react-router';

// This will be the root layout of the publicly viewable site
export default function SiteLayout() {
  return (
    <div>
      <h1>Test</h1>
      <Outlet />
    </div>
  );
}
