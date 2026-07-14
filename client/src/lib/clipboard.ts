import { toast } from 'sonner';

// Copies data to the user's clipboard
export function copyToClipboard(data: string | number) {
  navigator.clipboard.writeText(data.toString());
  toast.success('Copied to clipboard!');
  return;
}
