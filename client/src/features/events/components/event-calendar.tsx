
import { useState, useMemo } from 'react';
import { useGetAllEventsQuery } from '../state/events-api-slice';
import type { Event } from '../events.dto';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, startOfMonth, addWeeks, isSameDay, isSameMonth, isBefore, isAfter, setHours, setMinutes, getHours, parseISO } from 'date-fns';

// Developer-configurable week view time range
const WEEK_START_HOUR = 8;
const WEEK_END_HOUR = 20;
const HOURS = Array.from({ length: WEEK_END_HOUR - WEEK_START_HOUR + 1 }, (_, i) => WEEK_START_HOUR + i);

export type CalendarView = 'month' | 'week';

function getEventsForDay(events: Event[], day: Date) {
	return events.filter(event => {
		const start = parseISO(event.startDate);
		const end = parseISO(event.endDate);
		return isSameDay(start, day) || isSameDay(end, day) ||
			(isBefore(start, day) && isAfter(end, day));
	});
}

function getEventsForHour(events: Event[], day: Date, hour: number) {
	return events.filter(event => {
		const start = parseISO(event.startDate);
		return isSameDay(start, day) && getHours(start) === hour;
	});
}

export function EventsCalendarView() {
	const [view, setView] = useState<CalendarView>('month');
	const [currentDate, setCurrentDate] = useState(new Date());
	const { data, isLoading, isError } = useGetAllEventsQuery({});
	const events = data?.data || [];

	// Display string for current month and year
	const monthYearLabel = format(currentDate, 'MMMM yyyy');

	// Month view grid
	const monthDays = useMemo(() => {
		const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
		return Array.from({ length: 42 }, (_, i) => addDays(start, i));
	}, [currentDate]);

	// Week view grid
	const weekDays = useMemo(() => {
		const start = startOfWeek(currentDate, { weekStartsOn: 0 });
		return Array.from({ length: 7 }, (_, i) => addDays(start, i));
	}, [currentDate]);

	// Navigation handlers
	const goToPrev = () => {
		setCurrentDate(view === 'month' ? addWeeks(currentDate, -4) : addDays(currentDate, -7));
	};
	const goToNext = () => {
		setCurrentDate(view === 'month' ? addWeeks(currentDate, 4) : addDays(currentDate, 7));
	};
	const goToToday = () => setCurrentDate(new Date());

	return (
		<div className="w-full">
			{/* Month/Year Label */}
			<div className="flex items-center justify-center mb-2">
				<span className="text-lg font-semibold tracking-wide">{monthYearLabel}</span>
			</div>
			{/* Controls */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex gap-2">
					<button className="btn btn-sm" onClick={goToPrev}>Prev</button>
					<button className="btn btn-sm" onClick={goToToday}>Today</button>
					<button className="btn btn-sm" onClick={goToNext}>Next</button>
				</div>
				<div className="flex gap-2">
					<button className={cn('btn btn-sm', view === 'month' && 'btn-primary')} onClick={() => setView('month')}>Month</button>
					<button className={cn('btn btn-sm', view === 'week' && 'btn-primary')} onClick={() => setView('week')}>Week</button>
				</div>
			</div>

			{/* Loading/Error */}
			{isLoading && <div>Loading events...</div>}
			{isError && <div className="text-red-500">Failed to load events.</div>}

			{/* Calendar Grid */}
			{view === 'month' ? (
				<div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
					{/* Day headers */}
					{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
						<div key={d} className="bg-muted py-2 text-center font-semibold text-xs uppercase">{d}</div>
					))}
					{/* Days */}
					{monthDays.map((day, idx) => {
						const dayEvents = getEventsForDay(events, day);
						return (
							<div
								key={idx}
								className={cn(
									'min-h-[100px] p-2 border border-border flex flex-col gap-1 bg-background',
									!isSameMonth(day, currentDate) && 'bg-muted/50 text-muted-foreground',
									isSameDay(day, new Date()) && 'ring-2 ring-primary'
								)}
							>
								<div className="text-xs font-bold mb-1">{format(day, 'd')}</div>
								<div className="flex flex-col gap-1">
									{dayEvents.map((event) => (
										<Card key={event.eventId} className="p-2 bg-accent/60">
											<div className="flex items-center gap-2">
												<span className="truncate text-xs font-medium">{event.name}</span>
												<Badge className="ml-auto" variant="secondary">{event.eventType.name}</Badge>
											</div>
											<div className="text-xs text-muted-foreground">
												{format(parseISO(event.startDate), 'MMM d, h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
											</div>
										</Card>
									))}
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
					{/* Time column header */}
					<div className="bg-muted"></div>
					{/* Day headers */}
					{weekDays.map((day) => (
						<div key={day.toISOString()} className="bg-muted py-2 text-center font-semibold text-xs uppercase">
							{format(day, 'EEE d')}
						</div>
					))}
					{/* Time rows */}
					{HOURS.map((hour) => (
						<>
							{/* Time label */}
							<div key={`label-${hour}`} className="bg-muted text-xs text-right pr-2 py-4 align-top font-semibold">
								{format(setHours(setMinutes(new Date(), 0), hour), 'h a')}
							</div>
							{/* Event cells for each day */}
							{weekDays.map((day) => {
								const hourEvents = getEventsForHour(events, day, hour);
								return (
									<div key={day.toISOString() + hour} className="min-h-[60px] border border-border bg-background p-1 flex flex-col gap-1">
										{hourEvents.map((event) => (
											<Card key={event.eventId} className="p-2 bg-accent/60">
												<div className="flex items-center gap-2">
													<span className="truncate text-xs font-medium">{event.name}</span>
													<Badge className="ml-auto" variant="secondary">{event.eventType.name}</Badge>
												</div>
												<div className="text-xs text-muted-foreground">
													{format(parseISO(event.startDate), 'h:mm a')} - {format(parseISO(event.endDate), 'h:mm a')}
												</div>
											</Card>
										))}
									</div>
								);
							})}
						</>
					))}
				</div>
			)}
		</div>
	);
}
