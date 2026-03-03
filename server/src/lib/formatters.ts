export function capitalizeFirst(str: string) {
  if (str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
}