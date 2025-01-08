import { format, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

// The latest source of truth for time
const localTime = '2025-01-06T14:48:11-03:00';

// Parse the time string to a Date object
const date = parseISO(localTime);

// Format the date to a readable string
const formattedTime = format(zonedTimeToUtc(date, 'America/Sao_Paulo'), 'yyyy-MM-dd HH:mm:ssXXX');

console.log(`The current local time is: ${formattedTime}`);
