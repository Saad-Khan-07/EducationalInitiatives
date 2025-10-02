/**
 * src/services/TaskService.ts
 * Service for coordinating specific business logic operations on tasks.
 */

// import { ITask } from '../models/Task';
import { ITask } from '../interfaces/ITask';
import { TaskPriority } from '../models/TaskPriority';
import { TimeUtils } from '../utils/TimeUtils';

export class TaskService {

    /**
     * Calculates the duration of a task in minutes.
     * @param task - The task object.
     * @returns The duration in minutes.
     */
    public static getTaskDuration(task: ITask): number {
        const startMinutes = TimeUtils.timeToMinutes(task.startTime);
        const endMinutes = TimeUtils.timeToMinutes(task.endTime);
        return endMinutes - startMinutes;
    }

    /**
     * Filters a list of tasks that fall within a given time range (inclusive of start, exclusive of end).
     * @param tasks - The list of tasks.
     * @param start - Start time (HH:MM).
     * @param end - End time (HH:MM).
     * @returns A filtered array of tasks.
     */
    public static getTasksByTimeRange(tasks: ITask[], start: string, end: string): ITask[] {
        const startMins = TimeUtils.timeToMinutes(start);
        const endMins = TimeUtils.timeToMinutes(end);

        return tasks.filter(task => {
            const taskStartMins = TimeUtils.timeToMinutes(task.startTime);
            const taskEndMins = TimeUtils.timeToMinutes(task.endTime);
            
            // A task is within the range if its start is on or after the range start
            // and its end is on or before the range end.
            return taskStartMins >= startMins && taskEndMins <= endMins;
        });
    }
    
    /**
     * Sorts tasks primarily by Priority (High to Low), and secondarily by start time.
     * (Provides an optional sorting view beyond the mandatory sort-by-time requirement).
     * @param tasks - The array of tasks to sort.
     * @returns A new array of sorted tasks.
     */
    public static sortTasksByPriority(tasks: ITask[]): ITask[] {
        // Define a mapping from priority enum to a sortable number (higher number = higher priority)
        const priorityOrder: Record<TaskPriority, number> = {
            [TaskPriority.HIGH]: 3,
            [TaskPriority.MEDIUM]: 2,
            [TaskPriority.LOW]: 1,
        };

        return [...tasks].sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 0;
            const priorityB = priorityOrder[b.priority] || 0;
            
            // Primary sort: Priority (descending)
            if (priorityB !== priorityA) {
                return priorityB - priorityA;
            }
            
            // Secondary sort: Start Time (ascending)
            return TimeUtils.compareTimeStrings(a.startTime, b.startTime);
        });
    }
}
