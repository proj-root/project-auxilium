import { formatDistanceToNowStrict } from 'date-fns';

// "3 hours ago" for feed and comment timestamps.
export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function capitalizeFirst(str: string) {
  if (str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function createUserInitials(str: string, delimiter: string = ' ') {
  // {data?.data?.name.charAt(0).toUpperCase() ||
  //   (data?.data.userProfile.firstName?.charAt(0).toUpperCase() ||
  //     '') +
  //     (data?.data.userProfile.lastName?.charAt(0).toUpperCase() ||
  //       '')}
  const firstLetters = str.split(delimiter).map((w) => w.charAt(0));
  return firstLetters.join('');
}
