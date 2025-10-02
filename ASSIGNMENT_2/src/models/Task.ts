/**
 * Task.ts
 * Core entity class representing a scheduled task for an astronaut
 */

import { TaskPriority } from './TaskPriority';
import { ITask } from '../interfaces/ITask';

/**
 * Task class representing a single scheduled activity
 * Implements ITask interface for consistency across the application
 */
export class Task implements ITask {
  /**
   * Unique identifier for the task
   * Generated automatically by TaskFactory
   */
  public readonly id: string;
  
  /**
   * Description of the task activity
   * E.g., "Morning Exercise", "Team Meeting"
   */
  public description: string;
  
  /**
   * Start time in HH:MM format (24-hour)
   * E.g., "09:00", "14:30"
   */
  public startTime: string;
  
  /**
   * End time in HH:MM format (24-hour)
   * Must be after startTime
   */
  public endTime: string;
  
  /**
   * Priority level of the task
   * Determines importance for scheduling conflicts
   */
  public priority: TaskPriority;
  
  /**
   * Indicates whether the task has been completed
   * Default is false when task is created
   */
  public completed: boolean;
  
  /**
   * Timestamp of when the task was created
   * Used for tracking and potential sorting
   */
  public readonly createdAt: Date;
  
  /**
   * Optional timestamp of when the task was last modified
   * Updated when task properties change
   */
  public updatedAt?: Date;

  /**
   * Constructor to create a new Task instance
   * 
   * @param id - Unique identifier
   * @param description - Task description
   * @param startTime - Start time (HH:MM)
   * @param endTime - End time (HH:MM)
   * @param priority - Task priority level
   * @param completed - Completion status (default: false)
   * @param createdAt - Creation timestamp (default: current time)
   */
  constructor(
    id: string,
    description: string,
    startTime: string,
    endTime: string,
    priority: TaskPriority,
    completed: boolean = false,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.description = description;
    this.startTime = startTime;
    this.endTime = endTime;
    this.priority = priority;
    this.completed = completed;
    this.createdAt = createdAt;
  }

  /**
   * Returns a string representation of the task
   * Useful for logging and display purposes
   * 
   * @returns Formatted string with task details
   */
  public toString(): string {
    const status = this.completed ? '✓' : '○';
    return `[${status}] ${this.startTime}-${this.endTime}: ${this.description} [${this.priority}]`;
  }

  /**
   * Creates a deep copy of the task
   * Useful for creating modified versions without affecting the original
   * 
   * @returns New Task instance with same properties
   */
  public clone(): Task {
    const clonedTask = new Task(
      this.id,
      this.description,
      this.startTime,
      this.endTime,
      this.priority,
      this.completed,
      new Date(this.createdAt)
    );
    
    if (this.updatedAt) {
      clonedTask.updatedAt = new Date(this.updatedAt);
    }
    
    return clonedTask;
  }

  /**
   * Updates the task with new values
   * Sets the updatedAt timestamp
   * 
   * @param updates - Partial task object with properties to update
   */
  public update(updates: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    if (updates.description !== undefined) {
      this.description = updates.description;
    }
    if (updates.startTime !== undefined) {
      this.startTime = updates.startTime;
    }
    if (updates.endTime !== undefined) {
      this.endTime = updates.endTime;
    }
    if (updates.priority !== undefined) {
      this.priority = updates.priority;
    }
    if (updates.completed !== undefined) {
      this.completed = updates.completed;
    }
    
    this.updatedAt = new Date();
  }

  /**
   * Marks the task as completed
   * Updates both completed flag and timestamp
   */
  public markCompleted(): void {
    this.completed = true;
    this.updatedAt = new Date();
  }

  /**
   * Marks the task as incomplete
   * Resets the completed status
   */
  public markIncomplete(): void {
    this.completed = false;
    this.updatedAt = new Date();
  }

  /**
   * Checks if the task is currently active based on time
   * 
   * @param currentTime - Current time in HH:MM format (optional, defaults to system time)
   * @returns True if the task is currently in progress
   */
  public isActive(currentTime?: string): boolean {
    const now = currentTime || new Date().toTimeString().slice(0, 5);
    return now >= this.startTime && now <= this.endTime;
  }

  /**
   * Gets the duration of the task in minutes
   * 
   * @returns Duration in minutes
   */
  public getDurationInMinutes(): number {
    const startParts = this.startTime.split(':');
    const endParts = this.endTime.split(':');
    
    const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    
    return endMinutes - startMinutes;
  }

  /**
   * Converts the task to a JSON-serializable object
   * Useful for API responses or storage
   * 
   * @returns Plain object representation of the task
   */
  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      description: this.description,
      startTime: this.startTime,
      endTime: this.endTime,
      priority: this.priority,
      completed: this.completed,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt?.toISOString() || null,
      durationMinutes: this.getDurationInMinutes()
    };
  }

  /**
   * Creates a Task instance from a plain object
   * Useful for deserializing from JSON
   * 
   * @param obj - Plain object with task properties
   * @returns New Task instance
   */
  public static fromJSON(obj: Record<string, any>): Task {
    const task = new Task(
      obj.id,
      obj.description,
      obj.startTime,
      obj.endTime,
      obj.priority as TaskPriority,
      obj.completed || false,
      new Date(obj.createdAt)
    );
    
    if (obj.updatedAt) {
      task.updatedAt = new Date(obj.updatedAt);
    }
    
    return task;
  }

  /**
   * Validates if the task data is valid
   * Returns validation errors if any
   * 
   * @returns Array of validation errors (empty if valid)
   */
  public validate(): string[] {
    const errors: string[] = [];
    
    // Validate description
    if (!this.description || this.description.trim().length === 0) {
      errors.push('Task description cannot be empty');
    }
    
    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.startTime)) {
      errors.push(`Invalid start time format: ${this.startTime}`);
    }
    if (!timeRegex.test(this.endTime)) {
      errors.push(`Invalid end time format: ${this.endTime}`);
    }
    
    // Validate time range
    if (this.startTime >= this.endTime) {
      errors.push('End time must be after start time');
    }
    
    // Validate priority
    if (!Object.values(TaskPriority).includes(this.priority)) {
      errors.push(`Invalid priority: ${this.priority}`);
    }
    
    return errors;
  }
}