import { type NavItem } from '@/config/nav.config';
import { cn } from '@/lib/utils';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Calendar,
  HelpCircle,
  Home,
  MessageSquareText,
  Plus,
} from 'lucide-react';
import { Link, useLocation } from 'react-router';

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  calendar: Calendar,
  help: HelpCircle,
  feedback: MessageSquareText,
};

export function NavGroup({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) {
  const location = useLocation();
  const pathname = location.pathname;

  // Find the longest matching main item
  let activeIndex = -1;
  let longestMatchLength = -1;
  items.forEach((item, idx) => {
    if (pathname === item.url || pathname.startsWith(item.url + '/')) {
      if (item.url.length > longestMatchLength) {
        activeIndex = idx;
        longestMatchLength = item.url.length;
      }
    }
  });

  return (
    <SidebarGroup className={cn('', className)}>
      <SidebarGroupContent>
        <SidebarMenu className='gap-2'>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={'Create Event'}
              className='bg-primary text-primary-foreground hover:bg-primary/85 hover:text-primary-foreground'
            >
              <Link to={'/'}>
                <Plus />
                Create Event
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {items.map((item: NavItem, i) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={i === activeIndex}
              >
                <Link to={item.url}>
                  {item.icon &&
                    (() => {
                      const Icon = iconMap[item.icon];
                      return Icon ? <Icon /> : null;
                    })()}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function NavGroupSecondary({
  items,
  className,
}: {
  items: NavItem[];
  className?: string;
}) {
  return (
    <SidebarGroup className={cn('', className)}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item: NavItem) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className='hover:text-foreground text-muted-foreground hover:bg-transparent dark:hover:bg-transparent'
              >
                <Link to={item.url}>
                  {item.icon &&
                    (() => {
                      const Icon = iconMap[item.icon];
                      return Icon ? <Icon /> : null;
                    })()}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
