/**
 * IScheduleManager.ts
 * Interface defining the contract for Schedule Manager implementations
 * Ensures consistent API for task management operations
 */

import { ITask } from './ITask';
import { TaskPriority } from '../models/TaskPriority';

/**
 * Interface for Schedule Manager
 * Defines all operations for managing astronaut tasks
 */
export interface IScheduleManager {
  /**
   * Adds a new task to the schedule
   * Should validate for conflicts before adding
   * 
   * @param task - Task to be added
   * @throws Error if task conflicts with existing tasks or is invalid
   */
  addTask(task: ITask): void;
  
  /**
   * Removes a task from the schedule by description
   * 
   * @param description - Description of the task to remove
   * @returns True if task was removed, false if not found
   */
  removeTask(description: string): boolean;
  
  /**
   * Retrieves all tasks sorted by start time
   * 
   * @returns Array of all tasks ordered by start time
   */
  getAllTasks(): ITask[];
  
  /**
   * Retrieves tasks filtered by priority level
   * 
   * @param priority - Priority level to filter by
   * @returns Array of tasks with specified priority
   */
  getTasksByPriority(priority: TaskPriority): ITask[];
  
  /**
   * Updates an existing task with new values
   * Should validate the update doesn't create conflicts
   * 
   * @param taskId - ID of the task to update
   * @param updatedTask - Partial task object with new values
   * @throws Error if task not found or update creates conflict
   */
  updateTask(taskId: string, updatedTask: Partial<Omit<ITask, 'id' | 'createdAt'>>): void;
  
  /**
   * Marks a task as completed by description
   * 
   * @param description - Description of the task to mark complete
   * @throws Error if task not found
   */
  markTaskCompleted(description: string): void;
  
  /**
   * Finds a task by its description
   * 
   * @param description - Description to search for
   * @returns Task if found, undefined otherwise
   */
  getTaskByDescription(description: string): ITask | undefined;
  
  /**
   * Removes all tasks from the schedule
   * Useful for resetting the daily schedule
   */
  clearAllTasks(): void;
  
  /**
   * Gets tasks within a specific time range
   * 
   * @param startTime - Start of time range (HH:MM)
   * @param endTime - End of time range (HH:MM)
   * @returns Array of tasks that fall within the time range
   */
  getTasksByTimeRange?(startTime: string, endTime: string): ITask[];
  
  /**
   * Gets all completed tasks
   * 
   * @returns Array of completed tasks
   */
  getCompletedTasks?(): ITask[];
  
  /**
   * Gets all pending (not completed) tasks
   * 
   * @returns Array of pending tasks
   */
  getPendingTasks?(): ITask[];
  
  /**
   * Checks if a task would conflict with existing tasks
   * 
   * @param task - Task to check for conflicts
   * @returns The conflicting task if exists, null otherwise
   */
  checkForConflict?(task: ITask): ITask | null;
  
  /**
   * Gets the total count of tasks
   * 
   * @returns Number of tasks in the schedule
   */
  getTaskCount?(): number;
  
  /**
   * Exports all tasks to a JSON string
   * Useful for saving/backing up the schedule
   * 
   * @returns JSON string representation of all tasks
   */
  exportToJSON?(): string;
  
  /**
   * Imports tasks from a JSON string
   * Replaces existing tasks
   * 
   * @param jsonString - JSON string containing tasks
   * @throws Error if JSON is invalid or tasks are invalid
   */
  importFromJSON?(jsonString: string): void;
}