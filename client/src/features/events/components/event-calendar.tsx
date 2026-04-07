import {
  addHours,
  endOfHour,
  format,
  getDay,
  parse,
  startOfWeek,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop, {
  type withDragAndDropProps,
} from 'react-big-calendar/lib/addons/dragAndDrop';

// --- SETUP --- //
// Create drag and drop component
const DnDCalendar = withDragAndDrop(Calendar);

// Edit locales here
const locales = {
  'en-US': enUS,
};

// We will use date-fns as our localizer
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// --- TEST DATA --- //
const now = new Date();
const testEvents = [
  {
    title: 'Learn cool stuff',
    start: endOfHour(now),
    end: addHours(now, 2),
  },
];

export function EventsCalendarView() {
  return (
    <div>
      <DnDCalendar
        defaultView='month'
        events={testEvents}
        localizer={localizer}
      />
    </div>
  );
}
