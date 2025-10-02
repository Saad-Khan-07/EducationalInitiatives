/**
 * src/patterns/observer/TaskLogger.ts
 * OBSERVER PATTERN: File logging observer.
 * Logs all schedule events (info, warnings, and errors) to the application's file logger.
 */

// import { IObserver, IEventData, ScheduleEvent } from '../../interfaces/ICommon';
import { Logger } from '../../utils/Logger';
// import { ITask } from '../../models/Task';
import { IObserver } from '../../interfaces/IObserver';
import { IEventData } from '../../interfaces/IObserver';
import { ScheduleEvent } from '../../interfaces/IObserver';
import { ITask } from '../../interfaces/ITask';

/**
 * TaskLogger - Observer implementation
 * This observer ensures every critical operation and error is recorded for audit and debugging.
 */
export class TaskLogger implements IObserver {
    private readonly name: string = 'TaskLogger';
    
    /**
     * Update method called by the Subject (ScheduleManager) when an event occurs.
     * Delegates the logging responsibility to the centralized Logger service based on event type.
     * @param event - The event type string.
     * @param data - Event data, including the message, timestamp, and context.
     */
    public update(event: string, data: IEventData): void {
        const { message, context, isError } = data;
        
        // Extract meta data for structured logging
        const meta = {
            event,
            taskId: context?.task?.id,
            taskDescription: context?.task?.description,
            // Include specific error name if available
            errorName: context?.errorName 
        };

        try {
            switch (event) {
                // --- Error and Conflict Events (Logged as Error or Warning) ---
                case ScheduleEvent.TASK_CONFLICT:
                    // Log conflicts as warnings
                    const conflictingTask: ITask | undefined = context?.conflictingTask;
                    const conflictDetails = conflictingTask 
                        ? ` with existing task: ${conflictingTask.description} (${conflictingTask.startTime}-${conflictingTask.endTime})`
                        : '';
                        
                    Logger.warn(`[CONFLICT] ${message}${conflictDetails}`, meta);
                    break;

                case ScheduleEvent.TASK_ADD_FAILED:
                case ScheduleEvent.TASK_UPDATE_FAILED:
                case ScheduleEvent.TASK_VALIDATION_FAILED:
                    // Log failures as errors
                    Logger.error(`[FAILURE] ${message}`, undefined, meta);
                    break;

                // --- Informational Events (Logged as Info) ---
                case ScheduleEvent.TASK_ADDED:
                case ScheduleEvent.TASK_REMOVED:
                case ScheduleEvent.TASK_UPDATED:
                case ScheduleEvent.TASK_COMPLETED:
                case ScheduleEvent.SCHEDULE_CLEARED:
                case ScheduleEvent.SCHEDULE_IMPORTED:
                case ScheduleEvent.SCHEDULE_EXPORTED:
                    // Log all successful operations as info
                    Logger.info(`[OPERATION] ${message}`, meta);
                    break;

                default:
                    // Log unexpected or generic events
                    if (isError) {
                         Logger.error(`[UNHANDLED ERROR] ${message}`, undefined, meta);
                    } else {
                         Logger.info(`[UNHANDLED EVENT] ${message}`, meta);
                    }
                    break;
            }
        } catch (logError) {
            // This fallback is for logging system failures, ensuring the application doesn't crash 
            // even if the file logger fails to write (e.g., due to file permissions).
            console.error(`FATAL LOGGING ERROR in ${this.name}:`, logError);
        }
    }
}
