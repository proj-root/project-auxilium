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
  {
    title: 'Users',
    url: '/admin/users',
    icon: 'users',
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
    url: 'https://forms.gle/8RYR5G9XzgkzeNHD7',
    icon: 'feedback',
  },
  {
    title: 'Report a Bug',
    url: 'https://forms.gle/M4mgnc5xQX7hfx9x5',
    icon: 'bug',
  },
];
