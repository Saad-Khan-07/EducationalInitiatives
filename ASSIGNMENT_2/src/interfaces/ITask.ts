/**
 * ITask.ts
 * Interface defining the contract for Task entities
 * Ensures consistent structure across all task implementations
 */

import { TaskPriority } from '../models/TaskPriority';

/**
 * Interface for Task objects
 * Defines the required properties and methods for any task implementation
 */
export interface ITask {
  /**
   * Unique identifier for the task
   * Should be immutable once set
   */
  readonly id: string;
  
  /**
   * Human-readable description of the task
   * Should be non-empty and descriptive
   */
  description: string;
  
  /**
   * Start time in HH:MM format (24-hour)
   * Must be a valid time string
   */
  startTime: string;
  
  /**
   * End time in HH:MM format (24-hour)
   * Must be after startTime
   */
  endTime: string;
  
  /**
   * Priority level of the task
   * Determines importance in scheduling conflicts
   */
  priority: TaskPriority;
  
  /**
   * Indicates whether the task has been completed
   */
  completed: boolean;
  
  /**
   * Timestamp when the task was created
   * Should be immutable once set
   */
  readonly createdAt: Date;
  
  /**
   * Optional timestamp of last modification
   * Updated when any property changes
   */
  updatedAt?: Date;
  
  /**
   * Returns a string representation of the task
   * Used for display and logging purposes
   */
  toString(): string;
  
  /**
   * Creates a deep copy of the task
   * Useful for creating modified versions without affecting the original
   */
  clone(): ITask;
  
  /**
   * Updates the task with new values
   * Should update the updatedAt timestamp
   * 
   * @param updates - Partial task object with properties to update
   */
  update(updates: Partial<Omit<ITask, 'id' | 'createdAt'>>): void;
  
  /**
   * Marks the task as completed
   * Should set completed to true and update timestamp
   */
  markCompleted(): void;
  
  /**
   * Marks the task as incomplete
   * Should set completed to false and update timestamp
   */
  markIncomplete(): void;
  
  /**
   * Checks if the task is currently active
   * 
   * @param currentTime - Optional current time in HH:MM format
   * @returns True if the task is currently in progress
   */
  isActive(currentTime?: string): boolean;
  
  /**
   * Gets the duration of the task in minutes
   * 
   * @returns Duration in minutes
   */
  getDurationInMinutes(): number;
  
  /**
   * Converts the task to a JSON-serializable object
   * 
   * @returns Plain object representation
   */
  toJSON(): Record<string, any>;
  
  /**
   * Validates the task data
   * 
   * @returns Array of validation errors (empty if valid)
   */
  validate(): string[];
}