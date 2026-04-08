import { Share, Alert } from 'react-native';
import { Flight } from '../types';
import { formatDuration, getCabinClassLabel } from '../utils/helpers';
import { FlightLookupResult } from './flightLookup';

/**
 * Generate an iCal (.ics) string for a flight
 */
export const generateICalEvent = (flight: Flight): string => {
  const firstSeg = flight.segments[0];
  const lastSeg = flight.segments[flight.segments.length - 1];

  const depTime = new Date(firstSeg.departureTime);
  const arrTime = new Date(lastSeg.arrivalTime);

  const formatICalDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const summary = `${getCabinClassLabel(flight.cabinClass)} Flight: ${firstSeg.departureAirport.code} → ${lastSeg.arrivalAirport.code}`;
  const description = [
    `Airline: ${firstSeg.airline.name} (${firstSeg.flightNumber})`,
    `Class: ${getCabinClassLabel(flight.cabinClass)}`,
    `Duration: ${formatDuration(flight.totalDuration)}`,
    `Stops: ${flight.stops === 0 ? 'Nonstop' : flight.stops + ' stop(s)'}`,
    `Aircraft: ${firstSeg.aircraft}`,
    `Baggage: ${flight.baggageAllowance}`,
    flight.loungAccess ? 'Lounge Access: Included' : '',
    `Price: $${flight.price.toLocaleString()}`,
  ]
    .filter(Boolean)
    .join('\\n');

  const location = `${firstSeg.departureAirport.name} (${firstSeg.departureAirport.code})`;
  const uid = `${flight.id}@premiumflights.app`;
  const now = formatICalDate(new Date());

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PremiumFlights//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICalDate(depTime)}`,
    `DTEND:${formatICalDate(arrTime)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT3H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Flight departure in 3 hours',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Flight departure tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

/**
 * Share/export the iCal event for a full Flight object
 */
export const exportFlightToCalendar = async (flight: Flight | FlightLookupResult): Promise<void> => {
  // Handle FlightLookupResult (from flight number lookup)
  if ('flightNumber' in flight && 'departureAirport' in flight && !('segments' in flight)) {
    const lookup = flight as FlightLookupResult;
    const depTime = new Date(lookup.departureTime);
    const arrTime = new Date(lookup.arrivalTime);
    const formatICalDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

    const ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PremiumFlights//EN',
      'BEGIN:VEVENT',
      `UID:${lookup.flightNumber}@premiumflights.app`,
      `DTSTAMP:${formatICalDate(new Date())}`,
      `DTSTART:${formatICalDate(depTime)}`,
      `DTEND:${formatICalDate(arrTime)}`,
      `SUMMARY:Flight ${lookup.flightNumber}: ${lookup.departureAirport.code} → ${lookup.arrivalAirport.code}`,
      `DESCRIPTION:${lookup.airline.name} ${lookup.flightNumber}\\n${lookup.aircraft}\\nDuration: ${formatDuration(lookup.duration)}`,
      `LOCATION:${lookup.departureAirport.name} (${lookup.departureAirport.code})`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    await Share.share({
      message: ical,
      title: `${lookup.departureAirport.code} → ${lookup.arrivalAirport.code} Flight`,
    });
    return;
  }

  // Handle full Flight object
  const fullFlight = flight as Flight;
  const firstSeg = fullFlight.segments[0];
  const lastSeg = fullFlight.segments[fullFlight.segments.length - 1];
  const ical = generateICalEvent(fullFlight);

  await Share.share({
    message: ical,
    title: `${firstSeg.departureAirport.code} → ${lastSeg.arrivalAirport.code} Flight`,
  });
};
