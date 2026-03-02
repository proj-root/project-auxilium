export type NavItem = {
  title: string;
  url: string;
  icon?: string; // icon key
};

// --- For admin panel ---
export const SideBarNavItems: NavItem[] = [
  {
    title: 'Home',
    url: '/admin',
    icon: 'home',
  },
  {
    title: 'Events',
    url: '/admin/events',
    icon: 'calendar',
  },
];

export const SideBarNavFooterItems: NavItem[] = [
  {
    title: 'Help & Support',
    url: '/help',
    icon: 'help',
  },
  {
    title: 'Feedback',
    url: '/feedback',
    icon: 'feedback',
  },
];
