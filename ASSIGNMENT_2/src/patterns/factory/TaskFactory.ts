/**
 * TaskFactory.ts
 * Factory pattern implementation for creating Task objects
 * Centralizes task creation logic and ID generation
 */

import { Task } from '../../models/Task';
import { TaskPriority, parseTaskPriority } from '../../models/TaskPriority';
import { ValidationService } from '../../services/ValidationService';
import { InvalidTaskDescriptionError, InvalidTimeFormatError, InvalidTimeRangeError } from '../../utils/ErrorHandler';
import { TimeUtils } from '../../utils/TimeUtils';
import { Logger } from '../../utils/Logger';

/**
 * TaskFactory - Factory pattern implementation
 * Responsible for creating Task objects with proper validation and ID generation
 */
export class TaskFactory {
  /**
   * Static counter for generating unique task IDs
   * Increments with each task creation
   */
  private static taskCounter: number = 0;

  /**
   * Prefix for task IDs to make them more readable
   */
  private static readonly ID_PREFIX = 'TASK';

  /**
   * Creates a new Task object with validation
   * Encapsulates the complexity of task creation
   * 
   * @param description - Task description
   * @param startTime - Start time (HH:MM)
   * @param endTime - End time (HH:MM)
   * @param priority - Priority level (string or TaskPriority enum)
   * @returns Newly created Task object
   * @throws Various errors if validation fails
   */
  public static createTask(
    description: string,
    startTime: string,
    endTime: string,
    priority: string | TaskPriority
  ): Task {
    Logger.debug('Creating new task', {
      description,
      startTime,
      endTime,
      priority
    });

    // Validate inputs before creating the task
    this.validateInputs(description, startTime, endTime);

    // Parse priority if it's a string
    const taskPriority = this.parsePriority(priority);

    // Generate unique ID
    const taskId = this.generateTaskId();

    // Create the task object
    const task = new Task(
      taskId,
      description.trim(),
      TimeUtils.formatTime(startTime),
      TimeUtils.formatTime(endTime),
      taskPriority
    );

    // Perform final validation on the created task
    const validationErrors = task.validate();
    if (validationErrors.length > 0) {
      Logger.error('Task validation failed after creation', undefined, {
        errors: validationErrors
      });
      throw new Error(`Task validation failed: ${validationErrors.join(', ')}`);
    }

    Logger.info('Task created successfully', {
      taskId,
      description: task.description
    });

    return task;
  }

  /**
   * Creates a task from a plain object (e.g., from JSON)
   * Useful for importing tasks or creating from external data
   * 
   * @param data - Plain object with task properties
   * @returns New Task object
   */
  public static createTaskFromObject(data: {
    description: string;
    startTime: string;
    endTime: string;
    priority: string | TaskPriority;
    completed?: boolean;
  }): Task {
    const task = this.createTask(
      data.description,
      data.startTime,
      data.endTime,
      data.priority
    );

    // Set completion status if provided
    if (data.completed !== undefined) {
      if (data.completed) {
        task.markCompleted();
      } else {
        task.markIncomplete();
      }
    }

    return task;
  }

  /**
   * Creates multiple tasks from an array of data objects
   * Batch creation with validation
   * 
   * @param dataArray - Array of task data objects
   * @returns Array of created Task objects
   * @throws Error if any task creation fails
   */
  public static createMultipleTasks(dataArray: Array<{
    description: string;
    startTime: string;
    endTime: string;
    priority: string | TaskPriority;
    completed?: boolean;
  }>): Task[] {
    const tasks: Task[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      try {
        const task = this.createTaskFromObject(dataArray[i]);
        tasks.push(task);
      } catch (error) {
        errors.push(`Task ${i + 1}: ${(error as Error).message}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to create some tasks:\n${errors.join('\n')}`);
    }

    return tasks;
  }

  /**
   * Creates a copy of an existing task with a new ID
   * Useful for duplicating tasks
   * 
   * @param task - Task to copy
   * @param modifications - Optional modifications to apply
   * @returns New Task object with unique ID
   */
  public static cloneTask(
    task: Task,
    modifications?: Partial<{
      description: string;
      startTime: string;
      endTime: string;
      priority: TaskPriority;
    }>
  ): Task {
    const newTask = this.createTask(
      modifications?.description || task.description,
      modifications?.startTime || task.startTime,
      modifications?.endTime || task.endTime,
      modifications?.priority || task.priority
    );

    // Preserve completion status unless explicitly changed
    if (task.completed) {
      newTask.markCompleted();
    }

    return newTask;
  }

  /**
   * Generates a unique task ID
   * Format: TASK-YYYYMMDD-HHMMSS-XXXX
   * 
   * @returns Unique task ID string
   */
  private static generateTaskId(): string {
    const now = new Date();
    
    // Format date components
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Increment counter and format with padding
    this.taskCounter++;
    const counter = String(this.taskCounter).padStart(4, '0');
    
    // Combine into ID
    const id = `${this.ID_PREFIX}-${year}${month}${day}-${hours}${minutes}${seconds}-${counter}`;
    
    return id;
  }

  /**
   * Generates a simple sequential task ID
   * Alternative simpler ID generation
   * 
   * @returns Simple task ID
   */
  public static generateSimpleId(): string {
    this.taskCounter++;
    return `${this.ID_PREFIX}-${this.taskCounter}`;
  }

  /**
   * Parses priority string to TaskPriority enum
   * Handles both string and enum inputs
   * 
   * @param priority - Priority as string or enum
   * @returns TaskPriority enum value
   * @throws Error if priority is invalid
   */
  private static parsePriority(priority: string | TaskPriority): TaskPriority {
    // If already a TaskPriority enum, return as is
    if (Object.values(TaskPriority).includes(priority as TaskPriority)) {
      return priority as TaskPriority;
    }

    // Parse string to enum
    try {
      return parseTaskPriority(priority as string);
    } catch (error) {
      Logger.error('Invalid priority value', error as Error, { priority });
      throw error;
    }
  }

  /**
   * Validates task creation inputs
   * Centralizes validation logic
   * 
   * @param description - Task description
   * @param startTime - Start time
   * @param endTime - End time
   * @throws Various validation errors
   */
  private static validateInputs(
    description: string,
    startTime: string,
    endTime: string
  ): void {
    // Validate description
    try {
      ValidationService.validateDescription(description);
    } catch (error) {
      throw new InvalidTaskDescriptionError((error as Error).message);
    }

    // Validate time formats
    try {
      TimeUtils.validateTimeFormat(startTime);
      TimeUtils.validateTimeFormat(endTime);
    } catch (error) {
      throw new InvalidTimeFormatError((error as Error).message);
    }

    // Validate time range
    try {
      TimeUtils.validateTimeRange(startTime, endTime);
    } catch (error) {
      throw new InvalidTimeRangeError((error as Error).message);
    }
  }

  /**
   * Resets the task counter
   * Useful for testing or when starting a new day
   */
  public static resetCounter(): void {
    this.taskCounter = 0;
    Logger.debug('Task counter reset');
  }

  /**
   * Gets the current counter value
   * Useful for debugging or testing
   * 
   * @returns Current counter value
   */
  public static getCounterValue(): number {
    return this.taskCounter;
  }

  /**
   * Sets the counter to a specific value
   * Useful for testing or restoration
   * 
   * @param value - New counter value
   */
  public static setCounterValue(value: number): void {
    if (value < 0) {
      throw new Error('Counter value cannot be negative');
    }
    this.taskCounter = value;
    Logger.debug('Task counter set', { value });
  }

  /**
   * Creates a task with a specific ID
   * WARNING: Use with caution to avoid ID conflicts
   * 
   * @param id - Specific ID to use
   * @param description - Task description
   * @param startTime - Start time
   * @param endTime - End time
   * @param priority - Priority level
   * @returns Task with specified ID
   */
  public static createTaskWithId(
    id: string,
    description: string,
    startTime: string,
    endTime: string,
    priority: string | TaskPriority
  ): Task {
    // Validate inputs
    this.validateInputs(description, startTime, endTime);
    const taskPriority = this.parsePriority(priority);

    // Create task with specific ID
    const task = new Task(
      id,
      description.trim(),
      TimeUtils.formatTime(startTime),
      TimeUtils.formatTime(endTime),
      taskPriority
    );

    // Validate the created task
    const validationErrors = task.validate();
    if (validationErrors.length > 0) {
      throw new Error(`Task validation failed: ${validationErrors.join(', ')}`);
    }

    Logger.info('Task created with specific ID', { id, description });

    return task;
  }
}