import { Button } from '@/components/ui/button';
import { FilePlus, SquareArrowOutUpRight } from 'lucide-react';
import { useGenerateEventReportMutation } from '../state/events-api-slice';
import type { Event } from '../events.dto';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Temporary hardcoded link
const POINTS_SHEET_LINK =
  'https://docs.google.com/spreadsheets/d/1vn8km6Djd8bHNH8dui04gWJ7f6NnTqnQyNmtc2J50dk/edit?gid=0#gid=0';

export function GenerateEventReportButton({
  event,
  className,
}: {
  event: Event;
  className?: string;
}) {
  const [generateReport, { isLoading }] = useGenerateEventReportMutation();

  // Frontend validation
  const canGenerate = event.signupUrl && event.feedbackUrl && event.helpersUrl;

  const handleGenerate = async () => {
    try {
      const response = await generateReport({
        eventId: event.eventId,
      }).unwrap();
      toast(response.message, {
        dismissible: true,
        action: {
          label: (
            <p className='flex flex-row gap-1 items-center'>
              <SquareArrowOutUpRight className='size-3'/>View
            </p>
          ),
          onClick: () => window.open(POINTS_SHEET_LINK),
        },
      });
    } catch (error: any) {
      console.error('GenerateEventReport Error:', error);
      toast.error(error.data.message);
    } finally {
      return;
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={Boolean(!canGenerate || isLoading)}
      className={cn(className)}
    >
      <FilePlus className='size-5' />
      Generate Report
    </Button>
  );
}
