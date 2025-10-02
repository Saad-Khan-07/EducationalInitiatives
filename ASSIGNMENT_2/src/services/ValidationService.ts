/**
 * src/services/ValidationService.ts
 * Centralized service for validating task data and checking for schedule conflicts.
 * Adheres to the Single Responsibility Principle (SRP).
 */

import { Task } from '../models/Task';
import { ITask } from '../interfaces/ITask';
import { TimeUtils } from '../utils/TimeUtils';
import {
    TaskConflictError,
    InvalidTaskDescriptionError,
    TaskNotFoundError
} from '../utils/ErrorHandler';

/**
 * ValidationService provides static methods for robust input and schedule validation.
 */
export class ValidationService {

    /**
     * Performs comprehensive validation on a newly created Task object.
     * Throws specific AppErrors for invalid inputs (time format, time range).
     * * @param task - The Task object to validate.
     * @throws InvalidTimeFormatError, InvalidTimeRangeError, InvalidTaskDescriptionError
     */
    public static validateTask(task: Task): void {
        // 1. Check description validity
        if (!task.description || task.description.trim() === '') {
            throw new InvalidTaskDescriptionError('Task description cannot be empty.');
        }

        // 2. Validate time formats (errors handled by TimeUtils)
        TimeUtils.validateTimeFormat(task.startTime);
        TimeUtils.validateTimeFormat(task.endTime);

        // 3. Validate time range (start must be before end)
        TimeUtils.validateTimeRange(task.startTime, task.endTime);
        
        // Note: Priority parsing is handled in TaskFactory, ensuring a valid enum is passed here.
    }

    /**
     * Checks if a new task's time range conflicts with any existing tasks.
     * This method directly supports the mandatory requirement (4).
     * * @param newTask - The new task being added or edited.
     * @param existingTasks - The array of currently scheduled tasks (excluding the new/edited task itself).
     * @returns The conflicting Task object if an overlap is found, or null otherwise.
     * @throws TaskConflictError (optional, but good for immediate feedback)
     */
    public static checkTaskOverlap(newTask: ITask, existingTasks: ITask[]): ITask | null {
        for (const existingTask of existingTasks) {
            
            // Skip checking against itself during an edit operation
            if (existingTask.id === newTask.id) {
                continue;
            }

            const isOverlapping = TimeUtils.doTimeRangesOverlap(
                newTask.startTime, newTask.endTime,
                existingTask.startTime, existingTask.endTime
            );

            if (isOverlapping) {
                // Return the conflicting task to provide detailed feedback via Observer
                return existingTask;
            }
        }
        return null;
    }

    public static validateDescription(description: string): void {
        if (!description || description.trim() === '') {
            throw new InvalidTaskDescriptionError('Task description cannot be empty.');
        }
        // Add more rules here if needed (e.g., length, forbidden characters)
    }
    
    /**
     * Helper method to validate if a task can be identified by its description.
     * * @param description - The task description used for lookup.
     * @param foundTask - The result of the lookup (Task or undefined).
     * @returns The found Task if it exists.
     * @throws TaskNotFoundError if the task is undefined.
     */
    public static validateTaskFound(description: string, foundTask: ITask | undefined): ITask {
        if (!foundTask) {
            throw new TaskNotFoundError(`Task with description "${description}" not found.`);
        }
        return foundTask;
    }
}
