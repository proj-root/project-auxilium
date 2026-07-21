import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useInitAnimPreference,
  type AnimationPreference,
} from '@/hooks/use-initialise-anim-settings';

function InitAnimationSetting() {
  const { preference, setPreference, isLoaded } = useInitAnimPreference();

  return (
    <div className='border-muted flex items-center justify-between rounded-md border p-3'>
      <div className='flex flex-col gap-1'>
        <h1>Initialisation Screen Animation</h1>
        <p className='text-muted-foreground text-sm'>
          Configures the frequency of the startup screen animation
        </p>
      </div>
      {isLoaded ? (
        <Select
          defaultValue={preference}
          onValueChange={(value: AnimationPreference) => setPreference(value)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='always'>Always</SelectItem>
              <SelectItem value='daily'>Once a Day</SelectItem>
              <SelectItem value='never'>Never</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Skeleton className='h-8 w-[180px]' />
      )}
    </div>
  );
}

export function Preferences() {
  return (
    <div>
      <h1 className='text-2xl'>Miscellaneous</h1>
      <Separator className='my-2' />
      <div className='flex flex-col gap-4'>
        <InitAnimationSetting />
      </div>
    </div>
  );
}
