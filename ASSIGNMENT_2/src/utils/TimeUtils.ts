/**
 * src/utils/TimeUtils.ts
 * Utility class for time manipulation, conversion, and validation.
 * Crucial for mandatory time format, range, and overlap validation.
 */

import { InvalidTimeFormatError, InvalidTimeRangeError } from './ErrorHandler';

export class TimeUtils {
    // Regex to strictly enforce HH:MM format (24-hour clock)
    private static readonly TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

    /**
     * Validates if a time string is in the correct HH:MM format (24-hour).
     * @param time - The time string (e.g., "09:30").
     * @throws InvalidTimeFormatError if the format is incorrect.
     */
    public static validateTimeFormat(time: string): void {
        if (!TimeUtils.TIME_REGEX.test(time)) {
            throw new InvalidTimeFormatError(`Invalid time format "${time}". Must be HH:MM (24-hour format).`);
        }
    }

    /**
     * Validates that the startTime is chronologically before the endTime.
     * @param startTime - Start time (HH:MM).
     * @param endTime - End time (HH:MM).
     * @throws InvalidTimeRangeError if start time is not before end time.
     */
    public static validateTimeRange(startTime: string, endTime: string): void {
        const startMinutes = TimeUtils.timeToMinutes(startTime);
        const endMinutes = TimeUtils.timeToMinutes(endTime);

        if (startMinutes >= endMinutes) {
            throw new InvalidTimeRangeError(`Invalid time range: Start time (${startTime}) must be strictly before end time (${endTime}).`);
        }
    }

    /**
     * Converts an HH:MM time string into total minutes since midnight (00:00).
     * Essential for easy comparison and calculation.
     * @param time - Time string (HH:MM).
     * @returns Total minutes since midnight.
     */
    public static timeToMinutes(time: string): number {
        // Assume validateTimeFormat was called before or handle potential parsing errors defensively
        const [hourStr, minuteStr] = time.split(':');
        const hours = parseInt(hourStr, 10);
        const minutes = parseInt(minuteStr, 10);
        
        if (isNaN(hours) || isNaN(minutes)) {
            // Fallback: throw the format error if internal parsing fails unexpectedly
             throw new InvalidTimeFormatError(`Internal error converting time "${time}".`);
        }

        return (hours * 60) + minutes;
    }

    /**
     * Compares two time strings (HH:MM) to facilitate sorting.
     * @param time1 - The first time string.
     * @param time2 - The second time string.
     * @returns A negative number if time1 is earlier, positive if time1 is later, 0 if equal.
     */
    public static compareTimeStrings(time1: string, time2: string): number {
        const minutes1 = TimeUtils.timeToMinutes(time1);
        const minutes2 = TimeUtils.timeToMinutes(time2);
        return minutes1 - minutes2;
    }


    public static formatTime(time: string): string {
        this.validateTimeFormat(time);
        // Optionally, pad hours/minutes if needed (should already be valid)
        const [hours, minutes] = time.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    /**
     * Checks if two time ranges overlap.
     * Range 1: [start1, end1), Range 2: [start2, end2)
     * Overlap occurs if (start1 < end2) and (start2 < end1).
     * @param start1 - Start of range 1.
     * @param end1 - End of range 1.
     * @param start2 - Start of range 2.
     * @param end2 - End of range 2.
     * @returns True if the ranges overlap, false otherwise.
     */
    public static doTimeRangesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        const s1 = TimeUtils.timeToMinutes(start1);
        const e1 = TimeUtils.timeToMinutes(end1);
        const s2 = TimeUtils.timeToMinutes(start2);
        const e2 = TimeUtils.timeToMinutes(end2);

        // Check for non-overlap condition first (easier logic)
        // If e1 <= s2 (range 1 ends before or exactly when range 2 starts) OR
        // If e2 <= s1 (range 2 ends before or exactly when range 1 starts)
        // Note: The task states a conflict if the ranges overlap, so meeting at the end point (e1 == s2) is NOT an overlap.
        return s1 < e2 && s2 < e1;
    }
}
