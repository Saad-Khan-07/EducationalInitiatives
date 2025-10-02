/**
 * ScheduleManager.ts
 * Singleton pattern implementation for managing the astronaut's daily schedule
 * Ensures only one instance exists throughout the application
 */

import { Task } from '../../models/Task';
import { TaskPriority } from '../../models/TaskPriority';
import { IScheduleManager } from '../../interfaces/IScheduleManager';
import { ISubject } from '../../interfaces/ISubject';
import { IObserver, IEventData, ScheduleEvent } from '../../interfaces/IObserver';
import { EventDataFactory } from '../../interfaces/ISubject';
// import { ValidationService } from '../../services/ValidationService';
import { ValidationService } from '../../services/ValidationService';
// import { TimeUtils } from '../../utils/TimeUtils';
import { TimeUtils } from '../../utils/TimeUtils';
// import { TaskConflictError, TaskNotFoundError } from '../../utils/ErrorHandler';
import { Logger } from '../../utils/Logger';
import { TaskConflictError, TaskNotFoundError } from '../../utils/ErrorHandler';

/**
 * ScheduleManager - Singleton pattern implementation
 * Manages all tasks and notifies observers of changes
 * Implements both IScheduleManager and ISubject interfaces
 */
export class ScheduleManager implements IScheduleManager, ISubject {
  /**
   * Private static instance for singleton pattern
   */
  private static instance: ScheduleManager;

  /**
   * Storage for all tasks, using task ID as key for O(1) lookup
   */
  private tasks: Map<string, Task>;

  /**
   * List of observers to be notified of schedule changes
   */
  private observers: IObserver[];

  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.tasks = new Map<string, Task>();
    this.observers = [];
    Logger.info('ScheduleManager singleton instance created');
  }

  /**
   * Get the singleton instance of ScheduleManager
   * Creates the instance if it doesn't exist
   * 
   * @returns The singleton ScheduleManager instance
   */
  public static getInstance(): ScheduleManager {
    if (!ScheduleManager.instance) {
      ScheduleManager.instance = new ScheduleManager();
    }
    return ScheduleManager.instance;
  }

  // ========== ISubject Implementation ==========

  /**
   * Attach an observer to receive notifications
   * 
   * @param observer - Observer to attach
   * @returns True if successfully attached
   */
  public attach(observer: IObserver): boolean {
    if (this.observers.includes(observer)) {
      Logger.warn('Observer already attached', { 
        observerName: observer.getName?.() 
      });
      return false;
    }
    
    this.observers.push(observer);
    Logger.info('Observer attached', { 
      observerName: observer.getName?.(),
      totalObservers: this.observers.length 
    });
    return true;
  }

  /**
   * Detach an observer from receiving notifications
   * 
   * @param observer - Observer to detach
   * @returns True if successfully detached
   */
  public detach(observer: IObserver): boolean {
    const index = this.observers.indexOf(observer);
    if (index === -1) {
      Logger.warn('Observer not found for detachment', { 
        observerName: observer.getName?.() 
      });
      return false;
    }
    
    this.observers.splice(index, 1);
    Logger.info('Observer detached', { 
      observerName: observer.getName?.(),
      totalObservers: this.observers.length 
    });
    return true;
  }

  /**
   * Notify all observers of an event
   * 
   * @param event - The event type
   * @param data - Event data
   */
  public notify(event: string, data: IEventData): void {
    Logger.debug(`Notifying ${this.observers.length} observers of event: ${event}`);
    
    for (const observer of this.observers) {
      try {
        // Check if observer is interested in this event
        if (observer.isInterestedIn && !observer.isInterestedIn(event)) {
          continue;
        }
        
        observer.update(event, data);
      } catch (error) {
        Logger.error('Observer notification failed', error as Error, {
          observerName: observer.getName?.(),
          event
        });
      }
    }
  }

  /**
   * Get the count of attached observers
   * 
   * @returns Number of observers
   */
  public getObserverCount(): number {
    return this.observers.length;
  }

  /**
   * Detach all observers
   */
  public detachAll(): void {
    this.observers = [];
    Logger.info('All observers detached');
  }

  // ========== IScheduleManager Implementation ==========

  /**
   * Add a new task to the schedule
   * Validates for conflicts before adding
   * 
   * @param task - Task to add
   * @throws TaskConflictError if task conflicts with existing tasks
   */
  public addTask(task: Task): void {
    try {
      // Validate the task
      ValidationService.validateTask(task);
      
      // Check for conflicts
      const conflictingTask = this.checkForConflict(task);
      if (conflictingTask) {
        const eventData = EventDataFactory.create(
          `Task "${task.description}" conflicts with "${conflictingTask.description}"`,
          { newTask: task, existingTask: conflictingTask }
        );
        
        this.notify(ScheduleEvent.TASK_CONFLICT, eventData);
        
        throw new TaskConflictError(
          `Task conflicts with existing task "${conflictingTask.description}" ` +
          `(${conflictingTask.startTime}-${conflictingTask.endTime})`
        );
      }
      
      // Add the task
      this.tasks.set(task.id, task);
      
      // Notify observers of successful addition
      const eventData = EventDataFactory.createSuccess(
        `Task "${task.description}" added successfully`,
        { task: task.toJSON() }
      );
      
      this.notify(ScheduleEvent.TASK_ADDED, eventData);
      
      Logger.logTaskOperation('ADD', task.description);
      
    } catch (error) {
      // Notify observers of failed addition
      const eventData = EventDataFactory.createError(
        error as Error,
        `Failed to add task "${task.description}"`
      );
      
      this.notify(ScheduleEvent.TASK_ADD_FAILED, eventData);
      throw error;
    }
  }

  /**
   * Remove a task from the schedule by description
   * 
   * @param description - Description of the task to remove
   * @returns True if removed, false if not found
   */
  public removeTask(description: string): boolean {
    const task = this.getTaskByDescription(description);
    
    if (!task) {
      Logger.warn('Task not found for removal', { description });
      return false;
    }
    
    const deleted = this.tasks.delete(task.id);
    
    if (deleted) {
      const eventData = EventDataFactory.createSuccess(
        `Task "${description}" removed successfully`,
        { taskId: task.id, task: task.toJSON() }
      );
      
      this.notify(ScheduleEvent.TASK_REMOVED, eventData);
      Logger.logTaskOperation('REMOVE', description);
    }
    
    return deleted;
  }

  /**
   * Get all tasks sorted by start time
   * 
   * @returns Array of tasks sorted by start time
   */
  public getAllTasks(): Task[] {
    const tasksArray = Array.from(this.tasks.values());
    
    // Sort by start time
    return tasksArray.sort((a, b) => 
      TimeUtils.compareTimeStrings(a.startTime, b.startTime)
    );
  }

  /**
   * Get tasks filtered by priority level
   * 
   * @param priority - Priority level to filter by
   * @returns Array of tasks with specified priority
   */
  public getTasksByPriority(priority: TaskPriority): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.priority === priority)
      .sort((a, b) => TimeUtils.compareTimeStrings(a.startTime, b.startTime));
  }

  /**
   * Update an existing task
   * Validates that update doesn't create conflicts
   * 
   * @param taskId - ID of task to update
   * @param updatedTask - Partial task with new values
   * @throws TaskNotFoundError if task not found
   * @throws TaskConflictError if update creates conflict
   */
  public updateTask(
    taskId: string, 
    updatedTask: Partial<Omit<Task, 'id' | 'createdAt'>>
  ): void {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      throw new TaskNotFoundError(`Task with ID "${taskId}" not found`);
    }
    
    // Create a temporary task with updated values for conflict checking
    const tempTask = task.clone();
    tempTask.update(updatedTask);
    
    // Validate the updated task
    ValidationService.validateTask(tempTask);
    
    // Check for conflicts (excluding the current task)
    const otherTasks = Array.from(this.tasks.values())
      .filter(t => t.id !== taskId);
    
    const conflictingTask = ValidationService.checkTaskOverlap(tempTask, otherTasks);
    
    if (conflictingTask) {
      const eventData = EventDataFactory.create(
        `Task update would conflict with "${conflictingTask.description}"`,
        { taskId, updatedTask, conflictingTask: conflictingTask.toJSON() }
      );
      
      this.notify(ScheduleEvent.TASK_UPDATE_FAILED, eventData);
      
      throw new TaskConflictError(
        `Update would conflict with task "${conflictingTask.description}"`
      );
    }
    
    // Apply the update
    task.update(updatedTask);
    
    // Notify observers
    const eventData = EventDataFactory.createSuccess(
      `Task "${task.description}" updated successfully`,
      { taskId, task: task.toJSON(), updates: updatedTask }
    );
    
    this.notify(ScheduleEvent.TASK_UPDATED, eventData);
    Logger.logTaskOperation('UPDATE', task.description);
  }

  /**
   * Mark a task as completed by description
   * 
   * @param description - Description of task to mark complete
   * @throws TaskNotFoundError if task not found
   */
  public markTaskCompleted(description: string): void {
    const task = this.getTaskByDescription(description);
    
    if (!task) {
      throw new TaskNotFoundError(`Task "${description}" not found`);
    }
    
    task.markCompleted();
    
    const eventData = EventDataFactory.createSuccess(
      `Task "${description}" marked as completed`,
      { task: task.toJSON() }
    );
    
    this.notify(ScheduleEvent.TASK_COMPLETED, eventData);
    Logger.logTaskOperation('COMPLETE', description);
  }

  /**
   * Find a task by its description
   * 
   * @param description - Description to search for
   * @returns Task if found, undefined otherwise
   */
  public getTaskByDescription(description: string): Task | undefined {
    return Array.from(this.tasks.values()).find(
      task => task.description.toLowerCase() === description.toLowerCase()
    );
  }

  /**
   * Clear all tasks from the schedule
   */
  public clearAllTasks(): void {
    const taskCount = this.tasks.size;
    this.tasks.clear();
    
    const eventData = EventDataFactory.createSuccess(
      `Schedule cleared. ${taskCount} tasks removed.`,
      { removedCount: taskCount }
    );
    
    this.notify(ScheduleEvent.SCHEDULE_CLEARED, eventData);
    Logger.info('All tasks cleared', { taskCount });
  }

  /**
   * Get tasks within a specific time range
   * 
   * @param startTime - Start of range (HH:MM)
   * @param endTime - End of range (HH:MM)
   * @returns Tasks that overlap with the time range
   */
  public getTasksByTimeRange(startTime: string, endTime: string): Task[] {
    TimeUtils.validateTimeRange(startTime, endTime);
    
    return Array.from(this.tasks.values()).filter(task => {
      return TimeUtils.doTimeRangesOverlap(
        task.startTime, task.endTime,
        startTime, endTime
      );
    }).sort((a, b) => TimeUtils.compareTimeStrings(a.startTime, b.startTime));
  }

  /**
   * Get all completed tasks
   * 
   * @returns Array of completed tasks
   */
  public getCompletedTasks(): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.completed)
      .sort((a, b) => TimeUtils.compareTimeStrings(a.startTime, b.startTime));
  }

  /**
   * Get all pending (not completed) tasks
   * 
   * @returns Array of pending tasks
   */
  public getPendingTasks(): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => !task.completed)
      .sort((a, b) => TimeUtils.compareTimeStrings(a.startTime, b.startTime));
  }

  /**
   * Check if a task conflicts with existing tasks
   * 
   * @param task - Task to check
   * @returns Conflicting task if exists, null otherwise
   */
  public checkForConflict(task: Task): Task | null {
    const existingTasks = Array.from(this.tasks.values());
    return ValidationService.checkTaskOverlap(task, existingTasks);
  }

  /**
   * Get the total count of tasks
   * 
   * @returns Number of tasks
   */
  public getTaskCount(): number {
    return this.tasks.size;
  }

  /**
   * Export all tasks to JSON string
   * 
   * @returns JSON string of all tasks
   */
  public exportToJSON(): string {
    const tasksArray = this.getAllTasks().map(task => task.toJSON());
    return JSON.stringify(tasksArray, null, 2);
  }

  /**
   * Import tasks from JSON string
   * Replaces existing tasks
   * 
   * @param jsonString - JSON string containing tasks
   * @throws Error if JSON is invalid
   */
  public importFromJSON(jsonString: string): void {
    try {
      const tasksData = JSON.parse(jsonString);
      
      if (!Array.isArray(tasksData)) {
        throw new Error('JSON must contain an array of tasks');
      }
      
      // Clear existing tasks
      this.tasks.clear();
      
      // Import new tasks
      for (const taskData of tasksData) {
        const task = Task.fromJSON(taskData);
        ValidationService.validateTask(task);
        this.tasks.set(task.id, task);
      }
      
      const eventData = EventDataFactory.createSuccess(
        `Imported ${tasksData.length} tasks successfully`,
        { importedCount: tasksData.length }
      );
      
      this.notify(ScheduleEvent.SCHEDULE_IMPORTED, eventData);
      Logger.info('Tasks imported from JSON', { count: tasksData.length });
      
    } catch (error) {
      Logger.error('Failed to import tasks from JSON', error as Error);
      throw error;
    }
  }
}